'use strict';
import { Storage, Bucket, File, BucketConfig, WriteStreamOptions } from '@google-cloud/storage';
import * as fs from 'fs';
import * as _ from 'lodash';

import { query, QueryResult } from '../../database-util/connection-pool';
import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';

import { FoodListingUpload } from '../../../../shared/src/receiver-donor/food-listing-upload';
import { FoodListing } from '../../../../shared/src/receiver-donor/food-listing';
import { DateFormatter } from '../../../../shared/src/date-time-util/date-formatter';

require('dotenv');


/**
 * Storage bucket object used to communicate with Google Cloud.
 */
let storageBucket: Storage = require('@google-cloud/storage') ({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID
});


/**
 * Adds a food listing to the database and saves associated image to either a local filesystem (development mode) or Google photo bucket.
 * @param foodListingUpload The food listing that will be added.
 * @param donorAppUserKey The key identifier of the App User that donated the food listing.
 */
export async function addFoodListing(foodListingUpload: FoodListingUpload, donorAppUserKey: number): Promise <number> {

    const dateFormatter: DateFormatter = new DateFormatter();
    let imageNames: string[] = [];
    let imageUrls: string[] = [];

    // If we have an image form the Donor, then generate the name and URL for it before we create database entry.
    if (foodListingUpload.imageUploads != null) {
        foodListingUpload.imageUploads = _.compact(foodListingUpload.imageUploads);
        genAndFillImageUrlsAndNames(imageUrls, imageNames, foodListingUpload.imageUploads); // NOTE: imageUrls and imageNames modified internally!
    }
    
    // Construct prepared statement.
    let queryArgs = [ donorAppUserKey,
                      foodListingUpload.foodTypes,
                      foodListingUpload.foodTitle,
                      foodListingUpload.needsRefrigeration,
                      foodListingUpload.availableUntilDate.toISOString(),
                      foodListingUpload.estimatedWeight,
                      foodListingUpload.estimatedValue,
                      foodListingUpload.foodDescription,
                      imageUrls ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM addFoodListing();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    try {
        // Execute prepared statement.
        const result: QueryResult = await query(queryString, queryArgs);
        const foodListingKey: number = result.rows[0].addfoodlisting;
        logSqlQueryResult(result.rows);

        // Save any image(s) to storage bucket / disk.
        if (foodListingUpload.imageUploads != null) {
            await writeImgs(foodListingUpload.imageUploads, imageUrls, imageNames);
        }

        return foodListingKey;
    }
    catch (err) {
        console.log(err);
        throw new Error('Donor submission failed.');
    }
}


/**
 * Internally fills the given imageUrls and imageNames arrays with generated URLs and names based off of given imageUploads base64 image data.
 * @param imageUrls The image URLs array to fill (NOTE: INTERNALLY MODIFIED).
 * @param imageNames The image names array to fill (NOTE: INTERNALLY MODIFIED).
 * @param imageUploads The uploaded base64 image data.
 */
function genAndFillImageUrlsAndNames(imageUrls: string[], imageNames: string[], imageUploads: string[]): void {

    for (let i: number = 0; i < imageUploads.length; i++) {

        imageNames.push('img-' + Date.now().toString() + '.jpeg');
        imageUrls.push((process.env.DEVELOPER_MODE.toLowerCase() === 'true') ? ('/public/' + imageNames[i])
                                                                             : (process.env.BUCKET_URL + imageNames[i]));
    }
}


/**
 * Writes a base64 image to its appropriate storage destination - either local filesystem in development mode
 * or Google Cloud storage bucket in deployment mode.
 * @param imageUploads The base64 image uploads that are to be written to storage.
 * @param imageUrls The URLs which will be used to reference the images.
 * @param imageNames The names of the images.
 * @return A promise with no payload that will resolve on success.
 */
async function writeImgs(imageUploads: string[], imageUrls: string[], imageNames: string[]): Promise <void> {

    let imageUploadPromises: Promise <void>[] = [];

    for (let i: number = 0; i < imageUploads.length; i++) {

        // strip off the base64 header.
        const image: string = imageUploads[i].replace(/^data:image\/\w+;base64,/, '');

        // Write image to appropriate storage location.
        imageUploadPromises.push( (process.env.DEVELOPER_MODE === 'true') ? writeImgToLocalFs(image, imageUrls[i])
                                                                          : writeImgToBucket(image, imageNames[i]) );
    }

    // Execute image upload promises in parallel and return when all are finished.
    await Promise.all(imageUploadPromises);
}


/**
 * Writes a food listing image to the local filesystem (should be used in development mode).
 * @param image The image to write to the local filesystem.
 * @param imageUrl The url of the image.
 * @return A promise with no payload that will resolve on success.
 */
function writeImgToLocalFs(image: string, imageUrl: string): Promise <void> {

    // Wrap result in a promise.
    return new Promise((resolve, reject) => {

        // Write to local file system.
        fs.writeFile(global['rootDir'] + imageUrl, image, {encoding: 'base64'}, (err: Error) => {
            
            if (err) {
                console.log(err);
                reject();
            }
            else {
                console.log('successfully saved the image on local filesystem!');
                resolve();
            }
        });
    });
}


/**
 * Writes a food listing image to a Google Cloud storage bucket (should be used in deployment mode).
 * @param image The image to write to the storage bucket.
 * @param imageName The name of the image.
 * @return A promise with no payload that will resolve on success.
 */
async function writeImgToBucket(image: string, imageName: string): Promise <void> {

    let bucket: Bucket = storageBucket.bucket(process.env.GOOGLE_CLOUD_BUCKET_ID);
    let file: File = bucket.file(imageName);
    let imageBinary: Buffer = new Buffer(image, 'base64');

    // Save config for saving base64 image as jpeg.
    let saveConfig: WriteStreamOptions = {
        metadata: {
            contentType: 'image/jpeg',
            metadata: {
                custom: 'metadata'
            }
        },
        public: true,
        resumable: false
    };

    try {
        return await file.save(imageBinary, saveConfig);
    }
    catch (err) {
        console.log(err);
        throw new Error('Failed to save image in Google Cloud storage bucket.');
    } 
}
