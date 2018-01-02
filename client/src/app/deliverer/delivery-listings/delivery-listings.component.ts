import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';

import { DeliveryUtilService } from './delivery-services/delivery-util.service';

import { Delivery } from '../../../../../shared/deliverer/delivery';
import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { GPSCoordinate } from '../../../../../shared/common-util/geocode';
import { Address } from '../../../../../shared/app-user/app-user-info';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { TimeRange } from '../../../../../shared/app-user/time-range';


@Component({
    selector: 'delivery-listings',
    templateUrl: './delivery-listings.component.html',
    styleUrls: ['./delivery-listings.component.css']
})
export class DeliveryListingsComponent {

    /**
     * The current delivery listings to display.
     */
    @Input() private deliveryListings: Delivery[];

    /**
     * Emitted whenever a new litings is selected.
     */
    @Output() private selectListing: EventEmitter<number>;


    public constructor (
        private sessionDataService: SessionDataService,
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        this.deliveryListings = [];
        this.selectListing = new EventEmitter<number>();
    }
}
