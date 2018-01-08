import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { DeliveryUtilService } from './delivery-services/delivery-util.service';
import { SlickListComponent } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list.component';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { GetListingsService } from '../../misc-slick-components/slick-filtered-list/slick-list/services/get-listings.service';
import { ConsumableListingCacheService } from '../../misc-slick-components/slick-filtered-list/slick-list/services/consumable-listing-cache.service';
import { DeliveryListingDialogData, DeliveryListingDialogComponent } from './delivery-listing-dialog/delivery-listing-dialog.component';

import { Delivery } from '../../../../../shared/deliverer/delivery';
import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';


@Component({
    selector: 'delivery-listings',
    templateUrl: './delivery-listings.component.html',
    styleUrls: ['./delivery-listings.component.css', '../../misc-slick-components/slick-filtered-list/slick-list/slick-list.component.css']
})
export class DeliveryListingsComponent extends SlickListComponent <Delivery, DeliveryFilters> {

    @Input() private header: string;
    @Input() private isCart: boolean;


    public constructor (
        getListingsService: GetListingsService <Delivery, DeliveryFilters>,
        consumableListingCacheService: ConsumableListingCacheService <Delivery>,
        router: Router,
        dialogService: MatDialog,
        private sessionDataService: SessionDataService, // Referenced in HTML template
        private deliveryUtilService: DeliveryUtilService
    ) {
        super('/deliverer/getDeliveries', getListingsService, consumableListingCacheService, router, dialogService);

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


    /**
     * Filter applied to any new list data that has been received (on all append, refresh, or update operations).
     * @param newListData The new list data that will be filtered.
     */
    protected filterNewListings(newListData: Array <Delivery>): void {
        // Must ensure that all date fields are not JSON ISO strings (wraps them back into Date objects).
        this.deliveryUtilService.deserializeDeliveryData(newListData);
    }
}
