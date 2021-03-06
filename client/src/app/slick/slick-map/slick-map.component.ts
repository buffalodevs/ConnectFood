import { Component, Input, SimpleChanges, OnChanges } from '@angular/core';

import { GeocodeService, GPSCoordinate } from './geocode.service';

import { ContactInfo } from '../../../../../shared/src/app-user/contact-info';


@Component({
    selector: 'slick-map',
    templateUrl: './slick-map.component.html',
    styleUrls: ['./slick-map.component.css'],
    providers: [GeocodeService]
})
export class SlickMapComponent implements OnChanges {

    @Input() public gpsCenterCoordinate: GPSCoordinate;
    @Input() public zoom: number;
    @Input() public diameterMi: number;
    @Input() public addresses: ContactInfo[];
    @Input() public addressNames: string[];

    
    private _googleMapsHref: string;


    public constructor (
        private _geocodeService: GeocodeService
    ) {
        this.addresses = [];
        this.addressNames = [];
        
        this._googleMapsHref = this._geocodeService.BASE_GOOGLE_MAPS_HREF;
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Whenever new addresses is entered, then regenerate the link to google maps.
        if (changes.addresses) {
            this._googleMapsHref = this._geocodeService.generateGoogleMapsHref(this.addresses);            
        }

        if (changes.gpsCenterCoordinate || changes.addresses) {

            // If the center GPS coordinate was not explicitely provided, then attempt to calculate it from address GPS coordinates.
            this.gpsCenterCoordinate = (this.gpsCenterCoordinate != null) ? this.gpsCenterCoordinate
                                                                          : this.calcCenterFromAddresses(this.addresses);
        }

        if (changes.zoom || changes.diameterMi) {

            // If the zoom factor was not explicitely provided, then attempt to calculate it from provided diameter.
            if (this.zoom == null) {
                this.zoom = (this.diameterMi != null) ? this.calcZoomFromMapDiameter(this.diameterMi)
                                                      : 8;
            }
        }
    }


    /**
     * The link to the Google Maps direction page using the points present on this map istance.
     */
    get googleMapsHref(): string {
        return this._googleMapsHref;
    }


    /**
     * Attempts to calculate the center point of the map based on a set of provided address.
     * @param addresses The addresses from which to attempt to calculate the center point.
     * @return A GPS Coordinate that contains the center point of the map.
     *         NOTE: If no addresses provided, then (0, 0) is returned.
     */
    private calcCenterFromAddresses(addresses: ContactInfo[]): GPSCoordinate {

        const gpsMinLatLng: GPSCoordinate = new GPSCoordinate(10000, 10000);
        const gpsMaxLatLng: GPSCoordinate = new GPSCoordinate(-10000, -10000);

        for (let i: number = 0; i < addresses.length; i++) {

            if (addresses[i] != null) {

                gpsMinLatLng.latitude = ( gpsMinLatLng.latitude > addresses[i].gpsCoordinate.latitude ) ? addresses[i].gpsCoordinate.latitude
                                                                                                        : gpsMinLatLng.latitude;
                gpsMinLatLng.longitude = ( gpsMinLatLng.longitude > addresses[i].gpsCoordinate.longitude ) ? addresses[i].gpsCoordinate.longitude
                                                                                                           : gpsMinLatLng.longitude;
                gpsMaxLatLng.latitude = ( gpsMaxLatLng.latitude < addresses[i].gpsCoordinate.latitude ) ? addresses[i].gpsCoordinate.latitude
                                                                                                        : gpsMaxLatLng.latitude;
                gpsMaxLatLng.longitude = ( gpsMaxLatLng.longitude < addresses[i].gpsCoordinate.longitude ) ? addresses[i].gpsCoordinate.longitude
                                                                                                           : gpsMaxLatLng.longitude;
            }
        }

        return new GPSCoordinate((gpsMaxLatLng.latitude + gpsMinLatLng.latitude) / 2, (gpsMaxLatLng.longitude + gpsMinLatLng.longitude) / 2);
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
