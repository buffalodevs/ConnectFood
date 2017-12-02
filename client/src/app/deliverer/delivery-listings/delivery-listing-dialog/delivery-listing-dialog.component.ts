import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { AbstractSlickListDialog } from '../../../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { DeliveryUtilService } from '../delivery-services/delivery-util.service';

import { Delivery } from '../../../../../../shared/deliverer/delivery';
import { SlickListDialogComponent } from '../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component';


@Component({
    selector: 'delivery-listing-dialog',
    templateUrl: './delivery-listing-dialog.component.html',
    styleUrls: ['./delivery-listing-dialog.component.css', './../delivery-listings.component.css'],
    providers: [DeliveryUtilService]
})
export class DeliveryListingDialogComponent extends AbstractSlickListDialog <Delivery> {

    /**
     * This is a shadow of the slickListDialog member in AbstractSlickListDialog.
     * It is all that is needed to make basic dialog functions work (open, close, etc).
     */
    @ViewChild('SlickListDialogComponent') protected slickListDialog: SlickListDialogComponent;


    public constructor (
        private deliveryFoodListingUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        super();
    }
}
