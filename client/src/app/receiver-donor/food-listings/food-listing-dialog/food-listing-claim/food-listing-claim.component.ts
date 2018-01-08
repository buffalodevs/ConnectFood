import { Component, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
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
export class FoodListingClaimComponent implements OnChanges {

    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever a Food Listing has been completely claimed and it should be removed from parent comonents listings (Receive).
     */
    @Output() private removeListing: EventEmitter<void>;
    /**
     * Emitted whenever the dialog should close.
     */
    @Output() private close: EventEmitter<void>;

    private claimForm: FormGroup;
    private claimComplete: boolean;
    private showProgressSpinner: boolean;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.claimForm = new FormGroup({'unitsCount': new FormControl(1, [ Validators.required, Validators.min(1) ])});
        this.claimComplete = false;
        this.showProgressSpinner = false;
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
        
        const unitsCount: number = Number.parseInt(this.claimForm.get('unitsCount').value);
        let observer: Observable<boolean> = this.manageFoodListingService.claimFoodListing(this.foodListing.foodListingKey, unitsCount);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (success: boolean) => {

                        if (success) {

                            this.foodListing.unitsInfo.myClaimedUnitsCount += unitsCount;
                            this.foodListing.unitsInfo.availableUnitsCount -= unitsCount;

                            if (this.foodListing.unitsInfo.availableUnitsCount === 0)
                                {  this.removeListing.emit();  }
                            this.claimComplete = true;
                        }
                    },
                    (err: Error) => {
                        alert(err.message);
                    }
                );
    }
}
