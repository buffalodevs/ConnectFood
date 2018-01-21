'use strict';
import { query, QueryResult } from '../../database-util/connection-pool';
import { logSqlConnect, logSqlQueryExec, logSqlQueryResult } from '../../logging/sql-logger';
import * as fs from 'fs';
import { Storage, Bucket, File, BucketConfig, WriteStreamOptions } from '@google-cloud/storage';

import { addArgPlaceholdersToQueryStr } from '../../database-util/prepared-statement-util';

import { FoodListingUpload } from '../../../../shared/receiver-donor/food-listing-upload';
import { FoodListing } from '../../../../shared/receiver-donor/food-listing';
import { DateFormatter } from '../../../../shared/common-util/date-formatter';

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
export function addFoodListing(foodListingUpload: FoodListingUpload, donorAppUserKey: number): Promise<any> {

    const dateFormatter: DateFormatter = new DateFormatter();
    let imageNames: string[] = [];
    let imageUrls: string[] = [];

    // If we have an image form the Donor, then generate the name and URL for it before we create database entry.
    if (foodListingUpload.imageUploads != null) {
        genAndFillImageUrlsAndNames(imageUrls, imageNames, foodListingUpload.imageUploads); // NOTE: imageUrls and imageNames modified internally!
    }
    
    // Construct prepared statement.
    let queryArgs = [ donorAppUserKey,
                      foodListingUpload.foodTypes,
                      foodListingUpload.foodTitle,
                      foodListingUpload.needsRefrigeration,
                      foodListingUpload.availableUntilDate,
                      foodListingUpload.estimatedWeight,
                      foodListingUpload.estimatedValue,
                      foodListingUpload.foodDescription,
                      imageUrls ];
    let queryString = addArgPlaceholdersToQueryStr('SELECT * FROM addFoodListing();', queryArgs);
    logSqlQueryExec(queryString, queryArgs);

    // Execute prepared statement.
    return query(queryString, queryArgs)
        .then((result: QueryResult) => {
            logSqlQueryResult(result.rows);
            return writeImgs(foodListingUpload.imageUploads, imageUrls, imageNames);
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Donor submission failed.');
        });
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
 * @param index The index of the image to write (NOTE: should NOT be set by original caller).
 * @return A promise with no payload that will resolve on success.
 */
function writeImgs(imageUploads: string[], imageUrls: string[], imageNames: string[], index: number = 0): Promise <any> {

    // TODO: Write to Google Cloud Storage in bulk.

    // strip off the base64 header.
    const image: string = imageUploads[index].replace(/^data:image\/\w+;base64,/, '');

    // Write image to appropriate storage location. On failure, do nothing for now...
    let writePromise: Promise <any> = (process.env.DEVELOPER_MODE === 'true') ? writeImgToLocalFs(image, imageUrls[index])
                                                                              : writeImgToBucket(image, imageNames[index]);

    return writePromise.then(() => {

        // If we have reached not reached end of images to write, then call recursively, else return empty resolved promise.
        return (++index < imageUploads.length) ? writeImgs(imageUploads, imageUrls, imageNames, index)
                                               : Promise.resolve();
    });
}


/**
 * Writes a food listing image to the local filesystem (should be used in development mode).
 * @param image The image to write to the local filesystem.
 * @param imageUrl The url of the image.
 * @return A promise with no payload that will resolve on success.
 */
function writeImgToLocalFs(image: string, imageUrl: string): Promise <any> {

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
function writeImgToBucket(image: string, imageName: string): Promise <any> {

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

    return file.save(imageBinary, saveConfig)
        .then(() => {
            console.log('Successfully saved image in Google Cloud storage bucket.');
        })
        .catch((err: Error) => {
            console.log(err);
            throw new Error('Failed to save image in Google Cloud storage bucket.');
        }); 
}
