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
export class FoodListingUnclaimComponent implements OnChanges {

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


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.unclaimForm = new FormGroup({'unitsCount': new FormControl(1, [ Validators.required, Validators.min(1) ])});
        this.unclaimComplete = false;
        this.showProgressSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Listen for update of FoodListing input so we can set default unitsCount value and update max number validation!
        if (changes.foodListing != null && this.foodListing != null) {

            this.unclaimForm.get('unitsCount').setValue(this.foodListing.unitsInfo.myClaimedUnitsCount);
            this.unclaimForm.setValidators([ Validators.required, Validators.min(1), Validators.max(this.foodListing.unitsInfo.myClaimedUnitsCount) ]);
        }
    }


    /**
     * Unclaims the currently selected Food Listing.
     */
    private unclaimSelectedFoodListing(): void {

        if (!this.unclaimForm.valid) return;
        
        const unitsCount: number = Number.parseInt(this.unclaimForm.get('unitsCount').value);
        let observer: Observable<boolean> = this.manageFoodListingService.unclaimFoodListing(this.foodListing.foodListingKey, unitsCount);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (success: boolean) => {

                        if (success) {

                            this.foodListing.unitsInfo.myClaimedUnitsCount -= unitsCount;
                            this.foodListing.unitsInfo.availableUnitsCount += unitsCount;

                            // Remove only if all claimed units are depleted!
                            if (this.foodListing.unitsInfo.myClaimedUnitsCount === 0)
                                {  this.removeListing.emit();  }
                            this.unclaimComplete = true;
                        }
                    },
                    (err: Error) => {
                        alert(err.message);
                    }
                );
    }
}
