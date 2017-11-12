import { Component, OnInit, ViewChild } from '@angular/core';

import { AbstractSlickList } from '../../slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetDeliveryFoodListingsService } from './delivery-food-listing-services/get-delivery-food-listings.service';
import { DeliveryFoodListingUtilService } from './delivery-food-listing-services/delivery-food-listing-util.service';

import { DeliveryFoodListing } from '../../../../../shared/deliverer/delivery-food-listing';
import { DeliveryFoodListingsFilters } from '../../../../../shared/deliverer/delivery-food-listings-filters';
import { GPSCoordinate } from '../../../../../shared/common-util/geocode';
import { Address } from '../../../../../shared/app-user/app-user-info';


@Component({
    selector: 'delivery-food-listings',
    templateUrl: './delivery-food-listings.component.html',
    styleUrls: ['./delivery-food-listings.component.css']
})
export class DeliveryFoodListingsComponent extends AbstractSlickList <DeliveryFoodListing, DeliveryFoodListingsFilters> {

    @ViewChild('DeliveryFoodListingDialogComponent') protected slickListDialog: AbstractSlickListDialog <DeliveryFoodListing>;


    public constructor (
        private getDeliveryFoodListingsService: GetDeliveryFoodListingsService,
        private deliveryFoodListingUtilService: DeliveryFoodListingUtilService // Static methods referenced in html template
    ) {
        super(getDeliveryFoodListingsService, '/deliverer/getDeliveryFoodListings');
    }
}
