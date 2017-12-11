import * as googleDistance from 'google-distance';

import { GPSCoordinate } from '../../../shared/common-util/geocode';
export { GPSCoordinate };


/**
 * Container for driving distance and time.
 */
export class DriveDistTime {

    public constructor (
        public driveDistanceMi: number,
        public driveDurationMin: number
    ) {}
}


/**
 * Gets the driving distance and time from an origin GPS Coordinate to one or many destination GPS Coordinates.
 * @param origingpsCoordinate The origin GPS Coordinate.
 * @param destinationgpsCoordinate An array of one or more destination GPS Coordinates.
 * @return A promise that resolves to an array of the computed driving distances and times.
 */
export function getDrivingDistTime(origingpsCoordinate: GPSCoordinate, destinationgpsCoordinate: GPSCoordinate[]): Promise<DriveDistTime[]> {

    // Simply break out with a resolved promise if the given destinationgpsCoordinate array is empty!
    if (destinationgpsCoordinate == null || destinationgpsCoordinate.length === 0)  return Promise.resolve([]);

    return new Promise<DriveDistTime[]> (

        function (resolve: (value?: DriveDistTime[]) => void, reject: (reason?: Error) => void) {

            let origins: string[] = [ origingpsCoordinate.latitude.toString() + ',' + origingpsCoordinate.longitude.toString() ];
            let destinations: string[] = [];

            // Fill destinations array with correctly formatted destination GPS Coordinates.
            for (let i: number = 0; i < destinationgpsCoordinate.length; i++) {
                destinations.push(destinationgpsCoordinate[i].latitude.toString() + ',' +
                                    destinationgpsCoordinate[i].longitude.toString());
            }
            
            googleDistance.get(
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

                        console.log('Successfully calculated distances.');
                        return resolve(driveDistTime);
                    }

                    console.log(err);
                    return reject(new Error('Unexpected error encountered when calculating driving distances.'));
                }
            );
        }
    );
}