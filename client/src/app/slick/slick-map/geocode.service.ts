import { Injectable } from '@angular/core';

import { GPSCoordinate } from '../../../../../shared/src/geocode/gps-coordinate';
import { ContactInfo } from '../../../../../shared/src/app-user/contact-info';

export { GPSCoordinate };


@Injectable()
export class GeocodeService {

    public readonly BASE_GOOGLE_MAPS_HREF;


    public constructor() {
        this.BASE_GOOGLE_MAPS_HREF = 'https://www.google.com/maps/dir';
    }


    /**
     * Generates a Google Maps link href from given addresses.
     * @param addresses The addresses form which to generate the Google Maps link href.
     * @return The generated href.
     */
    public generateGoogleMapsHref(addresses: ContactInfo[]): string {
        
        let href: string = this.BASE_GOOGLE_MAPS_HREF;

        if (addresses != null) {

            for (let i: number = 0; i < addresses.length; i++) {

                // If address is valid, then include it in link.
                if (addresses[i] != null) {
                    href += ('/' + addresses[i].address + '+' + addresses[i].city + '+' + addresses[i].state + '+' + addresses[i].zip);
                }
            }
        }

        return href;
    }


    /**
     * Gets the GPS coordinates of the user's current position in real time.
     */
    public getMyGPSCoordinate(): Promise<GPSCoordinate> {
        if (navigator.geolocation) {
            return new Promise(
                function(resolve: (value?: GPSCoordinate) => void, reject: (reason?: Error) => void) {
                    navigator.geolocation.getCurrentPosition((position) => { resolve(new GPSCoordinate(position.coords.latitude, position.coords.longitude)); })
                }
            );
        }
    }
}
