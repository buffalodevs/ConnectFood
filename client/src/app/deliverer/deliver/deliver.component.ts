import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { DeliveryListingsComponent } from '../delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css', '../../misc-slick-components/slick-filtered-list/slick-filtered-list.component.css']
})
export class DeliverComponent implements OnInit {

    @ViewChild('deliveryListingsFilters') private deliveryListingsFiltersComponent: DeliveryListingsFiltersComponent;
    @ViewChild('deliveryListings') private deliveryListingsComponent: DeliveryListingsComponent;
    

    public constructor() {}


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.deliveryListingsFiltersComponent.addControl('matchAvailability', new FormControl(true));
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
     * Handles filters updates by refreshing the Delivery Listings with unscheduled Deliveries only.
     * @param filters The filters from the Delivery Listing Filters component.
     */
    private onFiltersUpdate(filters: DeliveryFilters): void {
        // Make sure we mark down that we only want unscheduled Deliveries!
        filters.unscheduledDeliveries = true;
        this.deliveryListingsComponent.refreshList(filters);
    }
}
