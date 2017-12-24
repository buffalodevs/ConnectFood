import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { AbstractSlickFilteredList } from '../../misc-slick-components/slick-filtered-list/abstract-slick-filtered-list';
import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';
import { DeliveryListingsComponent } from '../delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { Delivery, DeliveryState } from '../../../../../shared/deliverer/delivery';


@Component({
    selector: 'delivery-cart',
    templateUrl: './delivery-cart.component.html',
    styleUrls: ['./delivery-cart.component.css', '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component.css']
})
export class DeliveryCartComponent extends AbstractSlickFilteredList<Delivery, DeliveryFilters> implements OnInit {

    private deliveryStates: string[];


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        super();
        this.deliveryStates = this.deliveryUtilService.getDeliveryStateVals();
        this.deliveryStates[0] = null; // Replace 'Unscheduled' with null as first element for default 'Any State' value.
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {
        this.filters.addControl('deliveryState', new FormControl(null));
    }


    /**
     * Handles filters updates by refreshing the Delivery Listings with this user's scheduled Deliveries only.
     * @param filters The filters from the Delivery Listing Filters Component.
     */
    protected onFiltersUpdate(filters: DeliveryFilters): void {
        // Make sure we mark down that we only want this user's scheduled deliveries!
        filters.myScheduledDeliveries = true;
        super.onFiltersUpdate(filters);
    }
}
