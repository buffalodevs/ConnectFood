import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-claim',
    templateUrl: './food-listing-claim.component.html',
    styleUrls: ['./food-listing-claim.component.css']
})
export class FoodListingClaimComponent {

    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever a Food Listing has been completely claimed and it should be removed from parent comonents listings (Receive).
     */
    @Output() private removeListing: EventEmitter<void>;
    /**
     * Emitted whenever the dialog should close.
     */
    @Output() private close: EventEmitter<void>;

    private claimComplete: boolean;
    private showProgressSpinner: boolean;
    private errMsg: string;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.claimComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Claims the currently selected Food Listing.
     */
    private claimSelectedFoodListing(): void {
        
        let observer: Observable <void> = this.manageFoodListingService.claimFoodListing(this.foodListing.foodListingKey);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => {
                    this.claimComplete = true;
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
