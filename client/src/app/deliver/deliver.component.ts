import { Component, OnInit } from '@angular/core';

import { AbstractSlickList } from '../slick-list/abstract-slick-list';
import { GetDeliveryFoodListingsService } from './get-delivery-food-listings.service';

import { DeliveryFoodListing } from '../../../../shared/food-listings/delivery-food-listing';
import { DeliveryFoodListingsFilters } from '../../../../shared/food-listings/delivery-food-listings-filters';


@Component({
    selector: 'app-deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css'],
    providers: [GetDeliveryFoodListingsService]
})
export class DeliverComponent extends AbstractSlickList<DeliveryFoodListing, DeliveryFoodListingsFilters> implements OnInit {

    /**
     * Set to enable static Math methods to be used in template!
     */
    private Math: Math;
  
    // initial center position for the map
    private lat: number = 51.673858;
    private lng: number = 7.815982;


    constructor (
        getDeliveryFoodListingsService: GetDeliveryFoodListingsService
    ) {
        super(getDeliveryFoodListingsService, '/foodListings/getDeliveryFoodListings');
        this.Math = Math;
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


    private clickedMarker(label: string, index: number): void {
        console.log(`clicked the marker: ${label || index}`)
    }
  

    private mapClicked($event: MouseEvent): void {
        
    }
}
