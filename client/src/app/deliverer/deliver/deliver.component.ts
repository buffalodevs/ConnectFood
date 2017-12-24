import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { AbstractSlickFilteredList } from '../../misc-slick-components/slick-filtered-list/abstract-slick-filtered-list';
import { DeliveryListingsComponent } from '../delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { Delivery } from '../../../../../shared/deliverer/delivery';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css']
})
export class DeliverComponent extends AbstractSlickFilteredList<Delivery, DeliveryFilters> implements OnInit {    

    public constructor() {
        super();
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.filters.addControl('matchAvailability', new FormControl(true));
    }


    /**
     * Handles filters updates by refreshing the Delivery Listings with unscheduled Deliveries only.
     * @param filters The filters from the Delivery Listing Filters component.
     */
    protected onFiltersUpdate(filters: DeliveryFilters): void {
        // Make sure we mark down that we only want unscheduled Deliveries!
        filters.unscheduledDeliveries = true;
        super.onFiltersUpdate(filters);
    }
}
