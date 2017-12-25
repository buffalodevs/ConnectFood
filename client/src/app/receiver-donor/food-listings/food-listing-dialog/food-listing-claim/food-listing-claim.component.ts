import { Component, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-claim',
    templateUrl: './food-listing-claim.component.html',
    styleUrls: [
        './food-listing-claim.component.css',
        '../../food-listings.component.css',
        '../../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class FoodListingClaimComponent implements OnChanges {

    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever a Food Listing has been claimed and is to be removed from the respective listings in parent.
     */
    @Output() private claimed: EventEmitter<void>;
    /**
     * Emitted whenever the dialog should close.
     */
    @Output() private close: EventEmitter<void>;

    private claimForm: FormGroup;
    private claimComplete: boolean;
    private claimPromise: PromiseLike<any>;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.claimed = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.claimForm = new FormGroup({'unitsCount': new FormControl(1, [ Validators.required, Validators.min(1) ])});
        this.claimComplete = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Listen for update of FoodListing input so we can set default unitsCount value and update max number validation!
        if (changes.foodListing != null && this.foodListing != null) {

            this.claimForm.get('unitsCount').setValue(this.foodListing.unitsInfo.availableUnitsCount);
            this.claimForm.setValidators([ Validators.required, Validators.min(1), Validators.max(this.foodListing.unitsInfo.availableUnitsCount) ]);

            // If there is only one unit available, then automatically perform claim (no need for user to input units count).
            if (this.foodListing.unitsInfo.availableUnitsCount === 1) {
                this.claimSelectedFoodListing();
            }
        }
    }


    /**
     * Claims the currently selected Food Listing.
     */
    private claimSelectedFoodListing(): void {

        if (!this.claimForm.valid) return;
        
        let observer: Observable<boolean> = this.manageFoodListingService.claimFoodListing(this.foodListing.foodListingKey, this.claimForm.get('unitsCount').value);
        this.claimPromise = observer.toPromise();
        
        // Listen for result.
        observer.subscribe (
            (success: boolean) => {
                // On success, simply remove the Food Listing from the Receiver Food Listings interface by bubbling up claimedCompleted event to parent.
                if (success) {
                    this.claimed.emit();
                    //this.claimComplete = true;
                }
            },
            (err: Error) => {
                alert(err.message);
            }
        );
    }
}
