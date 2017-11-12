import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { AbstractSlickListDialog } from '../../../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { DeliveryFoodListingUtilService } from '../delivery-food-listing-services/delivery-food-listing-util.service';

import { DeliveryFoodListing } from '../../../../../../shared/deliverer/delivery-food-listing';
import { SlickListDialogComponent } from '../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component';


@Component({
    selector: 'delivery-food-listing-dialog',
    templateUrl: './delivery-food-listing-dialog.component.html',
    styleUrls: ['./delivery-food-listing-dialog.component.css', './../delivery-food-listings.component.css'],
    providers: [DeliveryFoodListingUtilService]
})
export class DeliveryFoodListingDialogComponent extends AbstractSlickListDialog <DeliveryFoodListing> {

    /**
     * This is a shadow of the slickListDialog member in AbstractSlickListDialog.
     * It is all that is needed to make basic dialog functions work (open, close, etc).
     */
    @ViewChild('SlickListDialogComponent') protected slickListDialog: SlickListDialogComponent;


    public constructor (
        private deliveryFoodListingUtilService: DeliveryFoodListingUtilService
    ) {
        super();
    }
}
