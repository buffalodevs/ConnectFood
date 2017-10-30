import * as geocoder from 'geocoder';


/**
 * Container for latitude and longitude GPS Coordinates.
 */
export class GPSCoordinate {
    constructor(
        public latitude?: number,
        public longitude?: number
    ) { }
}


/**
 * Gets the GPS Coordinates for a given address.
 * @param address The street address used to get the GPS Coordinates.
 * @param city The city.
 * @param state The state (can be abbreviated).
 * @param zip The 5 digit numeric ZIP code.
 * @return A promise containing the latitude and longitude GPS Coordinates wrapped in a container.
 */
export function getGPSCoordinate(address: string, city: string, state: string, zip: number): Promise<GPSCoordinate> {

    let fullAddress = address + ', ' + city + ', ' + zip.toString();

    // Wrap the result in a promise.
    return new Promise<GPSCoordinate>(geocode.bind(this, fullAddress));
}


/**
 * Geocodes a given full address and resolves or rejects based on the success of the geocoding.
 * @param fullAddress The full address.
 * @param resolve Called when the geocoding is successful.
 * @param reject Called when the geocoding fails.
 */
function geocode(fullAddress: string, resolve: (value?: GPSCoordinate) => void, reject: (reason?: Error) => void): void {

    // Use geocoder (which basically invokes Google Maps API) to get information on address.
    geocoder.geocode(fullAddress, function(err, data) {
        
        // On success (at least one valid result comes back).
        if (!err && data.results.length !== 0) {

            let latitude: number = data.results[0].geometry.location.lat;
            let longitude: number = data.results[0].geometry.location.lng;
            console.log('Successfully generated GPS coordinates: (' + latitude + ', ' + longitude + ')');
            return resolve(new GPSCoordinate(latitude, longitude));
        }
        
        // On over query limit (retry).
        if (data.status === 'OVER_QUERY_LIMIT') {
            console.log('Geocoder over query limit, retrying now.')
            return geocode(fullAddress, resolve, reject);
        }

        // On failure.
        console.log(err);
        reject(new Error('Invalid address provided.'));
    });
}
