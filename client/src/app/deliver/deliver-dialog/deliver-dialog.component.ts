import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { AbstractSlickListDialog } from '../../slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { DeliveryFoodListingUtilService } from '../delivery-food-listing-util.service';

import { DeliveryFoodListing } from '../../../../../shared/food-listings/delivery-food-listing';
import { SlickListDialogComponent } from '../../slick-list/slick-list-dialog/slick-list-dialog.component';


@Component({
    selector: 'deliver-dialog',
    templateUrl: './deliver-dialog.component.html',
    styleUrls: ['./deliver-dialog.component.css', './../deliver.component.css'],
    providers: [DeliveryFoodListingUtilService]
})
export class DeliverDialogComponent extends AbstractSlickListDialog <DeliveryFoodListing> {

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
