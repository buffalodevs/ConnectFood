import { Component, OnInit, Input } from '@angular/core';

import { GPSCoordinate } from '../../../../shared/common-util/geocode';
import { Address } from '../../../../shared/authentication/app-user-info';


@Component({
    selector: 'slick-map',
    templateUrl: './slick-map.component.html',
    styleUrls: ['./slick-map.component.css']
})
export class SlickMapComponent implements OnInit {

    @Input() private gpsCenterCoordinate: GPSCoordinate;
    @Input() private zoom: number;
    @Input() private diameterMi: number;
    @Input() private addresses: Address[] = [];
    @Input() private addressNames: string[] = [];


    public ngOnInit() {

        // Fill in any missing addressNames slots with empty strings to ensure 1:1 correlation between addresses and names!
        while (this.addressNames.length < this.addresses.length) {
            this.addressNames.push('');
        }

        // If the center GPS coordinate was not explicitely provided, then attempt to calculate it from address GPS coordinates.
        this.gpsCenterCoordinate = (this.gpsCenterCoordinate != null) ? this.gpsCenterCoordinate
                                                                      : this.calcCenterFromAddresses(this.addresses);

        // If the zoom factor was not explicitely provided, then attempt to calculate it from provided diameter.
        if (this.zoom == null) {
            this.zoom = (this.diameterMi != null) ? this.calcZoomFromMapDiameter(this.diameterMi)
                                                  : 8;
        }
    }


    /**
     * Generates a Google Maps directions web page link based on a contained set of addresses (provided originally as input to component).
     * @return The Google Maps directions web page link.
     */
    public genGoogleMapsHref(): string {
        
        let href: string = 'https://www.google.com/maps/dir';

        for (let i: number = 0; i < this.addresses.length; i++) {
            href += ('/' + this.addresses[i].address + '+' + this.addresses[i].city + '+' + this.addresses[i].state + '+' + this.addresses[i].zip);
        }

        return href;
    }


    /**
     * Attempts to calculate the center point of the map based on a set of provided address.
     * @param addresses The addresses from which to attempt to calculate the center point.
     * @return A GPS Coordinate that contains the center point of the map.
     *         NOTE: If no addresses provided, then (0, 0) is returned.
     */
    private calcCenterFromAddresses(addresses: Address[]): GPSCoordinate {

        let latitudeSum: number = 0;
        let longitudeSum: number = 0;

        for (let i: number = 0; i < addresses.length; i++) {
            latitudeSum += addresses[i].gpsCoordinate.latitude;
            longitudeSum += addresses[i].gpsCoordinate.longitude;
        }

        return new GPSCoordinate(latitudeSum / addresses.length, longitudeSum / addresses.length);
    }


    /**
     * Calculate the zoom factor for the map based on the estimated diameter of the map.
     * @param diameterMi The estimated diameter of the map (in miles).
     * @return The zoom factor in range [3, 14].
     */
    private calcZoomFromMapDiameter(diameterMi: number): number {

        // Compare against Google Maps scaling ratio estimates.
        if (diameterMi === 0)        return 14;
        if (diameterMi <= 2.5)       return 13;
        if (diameterMi <= 5)         return 12;
        if (diameterMi <= 10)        return 11;
        if (diameterMi <= 21)        return 10;
        if (diameterMi <= 40)        return 9;
        if (diameterMi <= 85)        return 8;
        if (diameterMi <= 150)       return 7;
        if (diameterMi <= 300)       return 6;
        if (diameterMi <= 600)       return 5;
        if (diameterMi <= 1300)      return 4;
        return 3;
    }


    /**
     * Converts an integer to a character. Each integer corresponds to one capitalized alphabet character.
     * For example, 0 corresponds to 'A', and 25 corresponds to 'Z'.
     * @param i The integer (zero based) to convert to a character.
     * @return The character conversion result.
     */
    private intToLetter(i: number): string {
        return String.fromCharCode('A'.charCodeAt(0) + i);
    }
}
