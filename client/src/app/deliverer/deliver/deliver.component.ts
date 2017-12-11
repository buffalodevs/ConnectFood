import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { DeliveryListingsComponent } from '../delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from '../delivery-listings/delivery-listings-filters/delivery-listings-filters.component';

import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { Delivery } from '../../../../../shared/deliverer/delivery';
import { ScheduleDeliveryService } from '../delivery-listings/delivery-services/schedule-delivery.service';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css', '../../slick-filtered-list/slick-filtered-list.component.css'],
    providers: [ScheduleDeliveryService]
})
export class DeliverComponent implements OnInit {

    @ViewChild('deliveryListingsFilters') private deliveryListingsFiltersComponent: DeliveryListingsFiltersComponent;
    @ViewChild('deliveryListings') private deliveryListingsComponent: DeliveryListingsComponent;

    private readonly minFiltersWidth: string;


    public constructor (
        private scheduleDeliveryService: ScheduleDeliveryService
    ) {
        this.minFiltersWidth = '262px';
    }


    /**
     * Executes after all input bindings have been established but before view children have been fully initialized.
     */
    public ngOnInit(): void {}


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


    /**
     * Creates a new Delivery Food Listing and starts the delivery immediately.
     */
    private startDelivery(): void {
        this.startOrScheduleDelivery(true);
    }


    /**
     * Creates a new Delivery Food Listing and schedules the start of the delivery for the future.
     * @param scheduledStartTime The scheduled start date-time for the new delivery.
     */
    private scheduleDelivery(scheduledStartTime: Date): void {
        this.startOrScheduleDelivery(false, scheduledStartTime);
    }


    /**
     * Schedules a new Delivery Food Listing.
     * @param startImmediately Set to true if the delivery should start immediately, fale if scheduled start in future. If true, then scheduledStartTime is ignored.
     * @param scheduledStartTime The time that the delivery should start.
     */
    private startOrScheduleDelivery(startImmediately: boolean, scheduledStartTime?: Date): void {

        let selectedDelivery: Delivery = this.deliveryListingsComponent.getSelectedListing();
        let observer: Observable<void> = this.scheduleDeliveryService.scheduleDelivery(selectedDelivery.claimedFoodListingKey, startImmediately, scheduledStartTime);
        
        // Listen for result.
        observer.subscribe(
            () => {
                // On success, simply remove the Delivery Food Listing from the Deliver interface.
                this.deliveryListingsComponent.removeSelectedListing();
            },
            (err: Error) => {
                console.log(err);
            }
        );
    }
}
