import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { DeliveryUtilService } from './delivery-services/delivery-util.service';
import { SlickListComponent } from '../../slick/slick-filtered-list/slick-list/slick-list.component';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { GetListingsService } from '../../slick/slick-filtered-list/slick-list/services/get-listings.service';
import { ConsumableListingCacheService } from '../../slick/slick-filtered-list/slick-list/services/consumable-listing-cache.service';
import { DeliveryListingDialogData, DeliveryListingDialogComponent } from './delivery-listing-dialog/delivery-listing-dialog.component';

import { Delivery } from '../../../../../shared/src/deliverer/delivery';
import { DeliveryFilters } from '../../../../../shared/src/deliverer/delivery-filters';


@Component({
    selector: 'delivery-listings',
    templateUrl: './delivery-listings.component.html',
    styleUrls: ['./delivery-listings.component.css', '../../slick/slick-filtered-list/slick-list/slick-list.component.css']
})
export class DeliveryListingsComponent extends SlickListComponent <Delivery, DeliveryFilters> {

    @Input() public header: string;
    @Input() public isCart: boolean;


    public constructor (
        elementRef: ElementRef,
        getListingsService: GetListingsService <Delivery, DeliveryFilters>,
        consumableListingCacheService: ConsumableListingCacheService <Delivery>,
        router: Router,
        dialogService: MatDialog,
        public sessionDataService: SessionDataService, // Referenced in HTML template
        public deliveryUtilService: DeliveryUtilService
    ) {
        super('/deliverer/getDeliveries', elementRef, getListingsService, consumableListingCacheService, router, dialogService);

        this.header = 'Delivery Listings';
        this.isCart = false;
    }


    /**
     * Selects a listing (and opens associated dialog) based on a given list index.
     * @param selectedListIndex The index of the listing to select.
     */
    public selectListing(selectedListIndex: number): void {

        // Prepare dialog configuration upon selection by setting input data for dialog.
        let dialogConfig: MatDialogConfig <DeliveryListingDialogData> = new MatDialogConfig <DeliveryListingDialogData>();
        dialogConfig.data = new DeliveryListingDialogData(this.listData[selectedListIndex].foodTitle, this.isCart);

        super.selectListing(selectedListIndex, DeliveryListingDialogComponent, dialogConfig);
    }
}
