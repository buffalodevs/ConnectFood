'use strict';
import * as _ from 'lodash';
import * as fs from 'fs';
import { Storage, Bucket, File, BucketConfig, WriteStreamOptions } from '@google-cloud/storage';

import { query, QueryResult } from '../../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import { logger, prettyjsonRender } from '../../logging/logger';
import { absToRelativeDateRanges } from "./../../common-util/date-time-util";

import { DateFormatter } from '../../../../shared/src/date-time-util/date-formatter';
import { FoodListing } from '../../../../shared/src/common-receiver-donor-deliverer/food-listing';
import { ImgData } from '../../../../shared/src/img/img-data';

require('dotenv');

/**
 * Local upload directory for images relative to root directory.
 * IMPORTANT: DO NOT put a leading '/' character or it will query http://public/... instead of localhost:5000/public/...
 */
const LOCAL_IMG_UPLOAD_DIR = 'public/';

/**
 * Storage bucket object used to communicate with Google Cloud.
 */
const storageBucket: Storage = require('@google-cloud/storage') ({
    projectId: process.env.FOOD_WEB_GOOGLE_CLOUD_PROJECT_ID
});


/**
 * Adds a food listing to the database and saves associated image to either a local filesystem (development mode) or Google photo bucket.
 * @param foodListing The food listing that will be added.
 * @param donorAppUserKey The key identifier of the App User that donated the food listing.
 */
export async function addFoodListing(foodListing: FoodListing, imgUploads: Express.Multer.File[], donorAppUserKey: number): Promise <number> {

    const dateFormatter: DateFormatter = new DateFormatter();

    // If we have a image(s) form the Donor, then generate the name and URL for it before we create database entry.
    foodListing.imgData = preprocImgUploads(imgUploads, foodListing.imgData);
    
    // Construct prepared statement.
    let queryArgs = [
        donorAppUserKey,
        foodListing.foodTypes,
        foodListing.foodTitle,
        foodListing.needsRefrigeration,
        foodListing.availableUntilDate.toISOString(),
        foodListing.estimatedWeight,
        foodListing.estimatedValue,
        foodListing.foodDescription,
        foodListing.recommendedVehicleType,
        foodListing.imgData,
        foodListing.foodListingAvailability
    ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM addFoodListing();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        // Execute prepared statement.
        const result: QueryResult = await query(queryString, queryArgs);
        const foodListingKey: number = result.rows[0].addfoodlisting;
        logSqlQueryResult(result.rows);

        // Save any image(s) to storage bucket / disk.
        if (foodListing.imgData != null) {
            await writeImgs(imgUploads, foodListing.imgData);
        }

        logger.info('Food listing with key ' + foodListingKey + ' successfully added by donor with ID ' + donorAppUserKey);
        return foodListingKey;
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Donor submission failed.');
    }
}


/**
 * Internally fills the given imgCrop(s) imgUrl property with generated URL(s) based off of uploaded imgCrops file names and environment.
 * @param imgUploads The image(s) that are to be preprocessed. If null, then nothing happens (null safe).
 * @param imgData The image data to generate and fill the URL(s) for.
 * @return The preprocessed image(s) (null if no images were uploaded to be preprocessed).
 */
function preprocImgUploads(imgUploads: Express.Multer.File[], imgData: ImgData[]): ImgData[] {

    if (imgUploads != null && imgUploads.length > 0) {

        imgUploads = _.compact(imgUploads);
        imgData = _.compact(imgData);

        for (let i: number = 0; i < imgUploads.length; i++) {

            // Generate image name based on <original image name> + '_' + <current date (ms since epoch)> + '.' + <image type>
            const fileNameSplits: string[] = imgUploads[i].originalname.split(/(.jpeg|.jpg|.png|.gif)/);
            imgUploads[i].filename = ( fileNameSplits[0] + '_' + (new Date()).valueOf() + '.' + imgUploads[i].mimetype.split('/')[1] );

            // Generate image URL for full sized images (using generated image name). Cropped image URL can easily be derived by prepending prefix.
            imgData[i].fullImgUrl = ( process.env.FOOD_WEB_DEVELOPER_MODE.toLowerCase() === 'true' )
                                  ? ( LOCAL_IMG_UPLOAD_DIR + imgUploads[i].filename )
                                  : ( process.env.FOOD_WEB_BUCKET_URL + imgUploads[i].filename );

            // Strip header off of base64 crop images.
            imgData[i].imgCropBase64Upload.image = imgData[i].imgCropBase64Upload.image.replace(/^data:image\/\w+;base64,/, '');
        }
    }

    return imgData;
}


/**
 * Writes an image to its appropriate storage destination - either local filesystem in development mode or Google Cloud storage bucket in deployment mode.
 * @param imgUploads Contains images that are to be written.
 * @param imgData Contains extra data (such as URL and crop bounds) associated with image uploads.
 * @return A promise with no payload that will resolve on success.
 */
async function writeImgs(imgUploads: Express.Multer.File[], imgData: ImgData[]): Promise <void> {

    let imageUploadPromises: Promise <void>[] = [];

    // Write all images (both full sized files and cropped base64 strings) to their appropriate destination based on environment.
    for (let i: number = 0; i < imgData.length; i++) {

        // Write to local filesystem.
        if (process.env.FOOD_WEB_DEVELOPER_MODE === 'true') {
            imageUploadPromises.push(writeImgToLocalFs(imgUploads[i], imgUploads[i].filename));
            imageUploadPromises.push(writeImgToLocalFs(imgData[i].imgCropBase64Upload.image, imgData[i].getCropImgFileName()))
        }
        // Write to Google Cloud Storage.
        else {
            imageUploadPromises.push(writeImgToBucket(imgUploads[i], imgUploads[i].filename, imgUploads[i].mimetype));
            imageUploadPromises.push(writeImgToBucket(imgData[i].imgCropBase64Upload.image, imgData[i].getCropImgFileName(), imgUploads[i].mimetype));
        }
    }

    // Execute image upload promises in parallel and return when all are finished.
    await Promise.all(imageUploadPromises);
}


/**
 * Writes a food listing image to the local filesystem (should be used in development mode).
 * @param imgUpload The image file/blob or base64 image string that is to be written to the local fs.
 * @param imgUrl The (relative) URL for the image that is to be written to the local fs.
 * @return A promise with no payload that will resolve on success.
 */
function writeImgToLocalFs(imgUpload: Express.Multer.File | string, filename: string): Promise <void> {

    // Wrap result in a promise.
    return new Promise((resolve, reject) => {

        let writeBuffer: Buffer | string;
        let writeOpts: any = null;

        // Are we dealing with base64 string?
        if (_.isString(imgUpload)) {
            writeBuffer = imgUpload;
            writeOpts = { encoding: 'base64' };
        }
        // Else are we dealing with File?
        else {
            writeBuffer = imgUpload.buffer;
        }

        // Write to local file system.
        const imgPath: string = ( global['rootDir'] + LOCAL_IMG_UPLOAD_DIR + filename );
        fs.writeFile(imgPath, writeBuffer, writeOpts, (err: Error) => {
            
            if (err) {
                logger.error(prettyjsonRender(err));
            }
            else {
                logger.debug('successfully saved the image on local filesystem under relative path: ' + imgPath);
            }

            resolve(); // If fail, mark Add Food Listing as succeeded for now (just won't have images).
        });
    });
}


/**
 * Writes a food listing image to a Google Cloud storage bucket (should be used in deployment mode).
 * @param imgUpload The image file/blob or base64 string that is to be written to Google Cloud Storage.
 * @param filename The filename for the image that is to be written to Google Cloud Storage.
 * @param mimetype The type of the image file that is to be written (e.g. image/jpeg).
 * @return A promise with no payload that will resolve on success.
 */
async function writeImgToBucket(imgUpload: Express.Multer.File | string, filename: string, mimetype: string): Promise <void> {

    const bucket: Bucket = storageBucket.bucket(process.env.FOOD_WEB_GOOGLE_CLOUD_BUCKET_ID);
    const bucketFile: File = bucket.file(filename);

    const imgBuffer: Buffer = (_.isString(imgUpload)) ? new Buffer(imgUpload, 'base64')
                                                      : imgUpload.buffer;

    // Save config for saving base64 image as jpeg.
    const saveConfig: WriteStreamOptions = {
        metadata: {
            contentType: mimetype,
            metadata: {
                custom: 'metadata'
            }
        },
        public: true,
        resumable: false
    };

    try {
        return await bucketFile.save(imgBuffer, saveConfig);
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw new Error('Failed to save image in Google Cloud storage bucket.');
    }
}
