import { Component, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-unclaim',
    templateUrl: './food-listing-unclaim.component.html',
    styleUrls: ['./food-listing-unclaim.component.css']
})
export class FoodListingUnclaimComponent {

    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever a Food Listing has been completely unclaimed and should be removed fromt he parent components list (Cart).
     */
    @Output() private removeListing: EventEmitter<void>;
    /**
     * Emitted whenever the dialog should close.
     */
    @Output() private close: EventEmitter<void>;

    private unclaimForm: FormGroup;
    private unclaimComplete: boolean;
    private showProgressSpinner: boolean;
    private errMsg: string;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.unclaimForm = new FormGroup({ unclaimReason: new FormControl(null, Validators.required) });
        this.unclaimComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Unclaims the currently selected Food Listing.
     */
    private unclaimSelectedFoodListing(): void {

        if (!this.unclaimForm.valid) return;
        
        const unclaimReason: string = this.unclaimForm.get('unclaimReason').value;
        let observer: Observable <void> = this.manageFoodListingService.unclaimFoodListing(this.foodListing.foodListingKey, unclaimReason);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => {
                    this.unclaimComplete = true;
                    this.showProgressSpinner = false;
                })
                .subscribe (
                    () => {
                        this.removeListing.emit();
                    },
                    (err: Error) => {
                        this.errMsg = err.message;
                    }
                );
    }
}
