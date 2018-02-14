import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';
import { FoodListing } from './../../../../../../../shared/src/common-receiver-donor-deliverer/food-listing';


@Component({
    selector: 'food-listing-claim',
    templateUrl: './food-listing-claim.component.html',
    styleUrls: ['./food-listing-claim.component.css']
})
export class FoodListingClaimComponent {

    @Input() public foodListing: FoodListing;

    /**
     * Emitted whenever the dialog should close.
     */
    @Output() public close: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing has been completely claimed and it should be removed from parent comonents listings (Receive).
     */
    @Output() public removeListing: EventEmitter<void>;

    public claimComplete: boolean;
    public showProgressSpinner: boolean;
    public errMsg: string;


    public constructor (
        private _manageFoodListingService: ManageFoodListingService
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
    public claimSelectedFoodListing(): void {
        
        let observer: Observable <void> = this._manageFoodListingService.claimFoodListing(this.foodListing.foodListingKey);
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
