import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';
import { DeliveryListingsComponent } from '../delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { Delivery, DeliveryState } from '../../../../../shared/deliverer/delivery';


@Component({
    selector: 'delivery-cart',
    templateUrl: './delivery-cart.component.html',
    styleUrls: [
        './delivery-cart.component.css',
        '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component.css',
        '../../misc-slick-components/slick-filtered-list/slick-filtered-list.component.css'
    ]
})
export class DeliveryCartComponent implements OnInit {

    @ViewChild('deliveryListingsFilters') private deliveryListingsFiltersComponent: DeliveryListingsFiltersComponent;
    @ViewChild('deliveryListings') private deliveryListingsComponent: DeliveryListingsComponent;

    private deliveryStates: string[];


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        this.deliveryStates = this.deliveryUtilService.getDeliveryStateVals();
        this.deliveryStates[0] = null; // Replace 'Unscheduled' with null as first element for default 'Any State' value.
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.deliveryListingsFiltersComponent.addControl('deliveryState', new FormControl(null));
    }


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        // First, trigger a refresh by manually invoking update function.
        this.onFiltersUpdate(this.deliveryListingsFiltersComponent.value);
        this.deliveryListingsFiltersComponent.valueChanges.subscribe(this.onFiltersUpdate.bind(this));
    }


    /**
     * Handles filters updates by refreshing the Delivery Listings with this user's scheduled Deliveries only.
     * @param filters The filters from the Delivery Listing Filters Component.
     */
    private onFiltersUpdate(filters: DeliveryFilters): void {
        // Make sure we mark down that we only want this user's scheduled deliveries!
        filters.myScheduledDeliveries = true;
        this.deliveryListingsComponent.refreshList(filters);
    }
}
