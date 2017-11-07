import { Component, OnInit, ViewChild } from '@angular/core';

import { AbstractSlickList } from '../slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetDeliveryFoodListingsService } from './delivery-food-listing-services/get-delivery-food-listings.service';
import { DeliveryFoodListingUtilService } from './delivery-food-listing-services/delivery-food-listing-util.service';

import { DeliveryFoodListing } from '../../../../shared/food-listings/delivery-food-listing';
import { DeliveryFoodListingsFilters } from '../../../../shared/food-listings/delivery-food-listings-filters';
import { GPSCoordinate } from '../../../../shared/common-util/geocode';
import { Address } from '../../../../shared/app-user/app-user-info';


@Component({
    selector: 'app-deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css']
})
export class DeliverComponent extends AbstractSlickList <DeliveryFoodListing, DeliveryFoodListingsFilters> implements OnInit {

    @ViewChild('DeliverDialogComponent') protected slickListDialog: AbstractSlickListDialog <DeliveryFoodListing>;


    public constructor (
        private getDeliveryFoodListingsService: GetDeliveryFoodListingsService,
        private deliveryFoodListingUtilService: DeliveryFoodListingUtilService
    ) {
        super(getDeliveryFoodListingsService, '/foodListings/getDeliveryFoodListings');
    }


    public ngOnInit(): void {
        // First, trigger a refresh by manually invoking update function.
        this.onFiltersUpdate(new DeliveryFoodListingsFilters());
        //this.deliveryFoodListingsFiltersComponent.onFiltersUpdate(this.onFiltersUpdate.bind(this));
    }


    /**
     * Handles filters updates by refreshing the Delivery Food Listings.
     * @param filters The filters from the Delivery Food Listing Filters component.
     */
    private onFiltersUpdate(filters: DeliveryFoodListingsFilters): void {
        this.refreshList(filters);
    }
}
