import * as googleDistance from 'google-distance';

import { GPSCoordinate } from '../../../shared/common-util/geocode';
export { GPSCoordinate };


/**
 * Gets the driving distance from an origin GPS Coordinate to one or many destination GPS Coordinates.
 * @param origingpsCoordinate The origin GPS Coordinate.
 * @param destinationgpsCoordinate An array of one or more destination GPS Coordinates.
 * @return A promise that resolves to an array of the computed driving distances.
 */
export function getDrivingDistances(origingpsCoordinate: GPSCoordinate, destinationgpsCoordinate: GPSCoordinate[]): Promise<number[]> {

    // Simply break out with a resolved promise if the given destinationgpsCoordinate array is empty!
    if (destinationgpsCoordinate == null || destinationgpsCoordinate.length === 0)  return Promise.resolve([]);

    return new Promise<number[]> (

        function (resolve: (value?: number[]) => void, reject: (reason?: Error) => void) {

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
                        let distances: number[] = [];

                        for (let i: number = 0; i < dataArr.length; i++) {
                            // Distances are in meters, so to get miles we divide by number of meters in a mile!
                            distances.push(dataArr[i].distanceValue / METERS_PER_MILE);
                            // Also, round the number to the nearest hundredths place.
                            distances[i] = Math.round(distances[i] * 100) / 100;
                        }

                        console.log('Successfully calculated distances.');
                        return resolve(distances);
                    }

                    console.log(err);
                    return reject(new Error('Unexpected error encountered when calculating driving distances.'));
                }
            );
        }
    );
}