import * as googleDistance from 'google-distance';
import * as moment from 'moment';
import * as _ from 'lodash';

import { DriveDistTime } from './drive-dist-time';
import { GPSCoordinate } from '../../../shared/src/geocode/gps-coordinate';
import { logger, prettyjsonRender } from '../logging/logger';

export { DriveDistTime, GPSCoordinate };


/**
 * Gets estimated arrival times for each point after the first in the given route GPS Coordinates. The arrival times are based off of given base travel time
 * @param routeGPSCoordinates A set of route GPS Coordinates that we shall get the estimated arrival times for (assuming first entry is start location).
 * @param travelStartTime The travel start timestamp from which to add segment driving durations to. Default is current time (now).
 * @return A promsie that will resolve to the estimated arrival times for each point after the first in routeGPSCoordinates.
 */
export async function getEstimatedArrivalTimes(routeGPSCoordinates: GPSCoordinate[], travelStartTime: Date = new Date()): Promise <Date[]> {

    const segmentDriveDistTimes: DriveDistTime[] = await getRouteSegmentDrivingDistTimes(routeGPSCoordinates);

    let estimatedArrivalTimes: Date[] = [];
    let segmentStartTime: Date = travelStartTime;
    
    for (let i: number = 0; i < segmentDriveDistTimes.length; i++) {

        const segmentDurMin: number = segmentDriveDistTimes[i].driveDurationMin;
        estimatedArrivalTimes.push(moment(segmentStartTime).add(segmentDurMin, 'm').toDate());
        segmentStartTime = estimatedArrivalTimes[i];
    }

    return estimatedArrivalTimes;
}


/**
 * Gets driving distances and times for each segment of a given route (set of sequential GPS Coordinates).
 * @param routeGPSCoordinates A set of route GPS Coordinates that shall be traversed in sequential order.
 * @return A promise that resolves to the driving distances and times of each segment of the route.
 */
export async function getRouteSegmentDrivingDistTimes(routeGPSCoordinates: GPSCoordinate[]): Promise <DriveDistTime[]> {

    let getDrivingDistTimePromises: Promise <DriveDistTime[]>[] = [];

    for (let i: number = 0; i < (routeGPSCoordinates.length - 1); i++) {

        const originGPSCoordinate: GPSCoordinate = routeGPSCoordinates[i];
        const destinationGpsCoordinate: GPSCoordinate = routeGPSCoordinates[i + 1];

        // Get driving distance and time for current segment, sum them in, and make next recursive call.
        const segmentDistTimePromise: Promise <DriveDistTime[]> = getDrivingDistTime(originGPSCoordinate, [ destinationGpsCoordinate ]);
        getDrivingDistTimePromises.push(segmentDistTimePromise);
    }
    
    // Each 1D array entry in the 2D array generated from all of the promises will have only one entry. Flatten will transform it into a 1D array here!
    const segmentDrivingDistTimes: DriveDistTime[][] = await Promise.all(getDrivingDistTimePromises);
    return _.flatten(segmentDrivingDistTimes);

}


/**
 * Gets the driving distance and time from an origin GPS Coordinate to one or many destination GPS Coordinates.
 * @param origingpsCoordinate The origin GPS Coordinate.
 * @param destinationgpsCoordinate An array of one or more destination GPS Coordinates.
 * @return A promise that resolves to an array of the computed driving distances and times.
 */
export function getDrivingDistTime(originGpsCoordinate: GPSCoordinate, destinationGpsCoordinate: GPSCoordinate[]): Promise <DriveDistTime[]> {

    // Simply break out with a resolved promise if the given destinationgpsCoordinate array is empty!
    if (destinationGpsCoordinate == null || destinationGpsCoordinate.length === 0)  return Promise.resolve([]);

    return new Promise <DriveDistTime[]> (

        (resolve: (value?: DriveDistTime[]) => void, reject: (reason?: Error) => void) => {

            let origins: string[] = [ originGpsCoordinate.latitude.toString() + ',' + originGpsCoordinate.longitude.toString() ];
            let destinations: string[] = [];

            // Fill destinations array with correctly formatted destination GPS Coordinates.
            for (let i: number = 0; i < destinationGpsCoordinate.length; i++) {
                destinations.push(destinationGpsCoordinate[i].latitude.toString() + ',' + destinationGpsCoordinate[i].longitude.toString());
            }
            
            googleDistance.get (
                // Arguments for calculating distance
                {
                    origins: origins,
                    destinations: destinations,
                    units: 'imperial'
                },

                // Callback function that will call promise resolve or reject functions.
                function(err, dataArr: any[]) {
                    
                    if (!err && dataArr.length > 0) {

                        const METERS_PER_MILE: number = 1609.34;
                        const SECONDS_PER_MINUTE: number = 60;
                        let driveDistTime: DriveDistTime[] = [];

                        for (let i: number = 0; i < dataArr.length; i++) {

                            // Distances are in meters, so to get miles we divide by number of meters in a mile (Also round to nearest 2 decimal places)!
                            let distance: number = Math.round(dataArr[i].distanceValue / METERS_PER_MILE * 100) / 100;
                            // Durations are in seconds, so to get minutes we divide by 60 seconds (Also round up to nearest whole minute)!
                            let duration: number = Math.ceil(dataArr[i].durationValue / SECONDS_PER_MINUTE);

                            driveDistTime.push(new DriveDistTime(distance, duration));
                        }

                        logger.debug('Successfully calculated distances.');
                        return resolve(driveDistTime);
                    }

                    // On over query limit (retry).
                    if (err === 'OVER_QUERY_LIMIT') {
                        logger.debug('Geocoder over query limit, retrying now.');
                        return getDrivingDistTime(originGpsCoordinate, destinationGpsCoordinate);
                    }

                    // On fatal error, just quit and let error bubble up!
                    logger.error(prettyjsonRender(err));
                    return reject(new Error('Unexpected error encountered when calculating driving distances.'));
                }
            );
        }
    );
}
