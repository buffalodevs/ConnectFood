import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { AbstractSlickList } from '../../misc-slick-components/slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetDeliveriesService } from './delivery-services/get-deliveries.service';
import { DeliveryUtilService } from './delivery-services/delivery-util.service';

import { Delivery } from '../../../../../shared/deliverer/delivery';
import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { GPSCoordinate } from '../../../../../shared/common-util/geocode';
import { Address } from '../../../../../shared/app-user/app-user-info';
import { SessionDataService } from '../../common-util/services/session-data.service';


@Component({
    selector: 'delivery-listings',
    templateUrl: './delivery-listings.component.html',
    styleUrls: ['./delivery-listings.component.css']
})
export class DeliveryListingsComponent extends AbstractSlickList <Delivery, DeliveryFilters> {

    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() private isCart: boolean;

    @ViewChild('DeliveryListingDialogComponent') protected slickListDialog: AbstractSlickListDialog <Delivery>;


    public constructor (
        private sessionDataService: SessionDataService,
        private getDeliveriesService: GetDeliveriesService,
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        super(getDeliveriesService, '/deliverer/getDeliveries');
        this.isCart = false;
    }
}
