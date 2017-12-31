import { Component, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-remove',
    templateUrl: './food-listing-remove.component.html',
    styleUrls: [
        './food-listing-remove.component.css',
        '../../food-listings.component.css',
        '../../../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component.css'
    ]
})
export class FoodListingRemoveComponent implements OnChanges {

    @Input() private foodListing: FoodListing;

    /**
     * Emitted whenever a Food Listing has been completely removed on server and should be removed fromt he parent components list (Cart).
     */
    @Output() private removeListing: EventEmitter<void>;
    /**
     * Emitted whenever the dialog should close.
     */
    @Output() private close: EventEmitter<void>;

    private removeForm: FormGroup;
    private removeComplete: boolean;
    private showProgressSpinner: boolean;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.removeForm = new FormGroup({'unitsCount': new FormControl(1, [ Validators.required, Validators.min(1) ])});
        this.removeComplete = false;
        this.showProgressSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Listen for update of FoodListing input so we can set default unitsCount value and update max number validation!
        if (changes.foodListing != null && this.foodListing != null) {

            this.removeForm.get('unitsCount').setValue(this.foodListing.unitsInfo.donorOnHandUnitsCount);
            this.removeForm.setValidators([ Validators.required, Validators.min(1), Validators.max(this.foodListing.unitsInfo.donorOnHandUnitsCount) ]);
        }
    }


    /**
     * Removes (un-donates) the currently selected Food Listing.
     */
    private removeSelectedFoodListing(): void {
        
        if (!this.removeForm.valid) return;
        
        const unitsCount: number = Number.parseInt(this.removeForm.get('unitsCount').value);
        let observer: Observable<boolean> = this.manageFoodListingService.removeFoodListing(this.foodListing.foodListingKey, unitsCount);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (success: boolean) => {

                        if (success) {

                            let availableUnitsCount: number = this.foodListing.unitsInfo.availableUnitsCount;
                            this.foodListing.unitsInfo.availableUnitsCount -= (availableUnitsCount >= unitsCount) ? unitsCount
                                                                                                                  : availableUnitsCount;
                            this.foodListing.unitsInfo.totalUnitsCount -= unitsCount;
                            this.foodListing.unitsInfo.donorOnHandUnitsCount -= unitsCount;

                            // Remove only if all claimed units are depleted!
                            if (this.foodListing.unitsInfo.availableUnitsCount === 0)
                                {  this.removeListing.emit();  }
                            this.removeComplete = true;
                        }
                    },
                    (err: Error) => {
                        alert(err.message);
                    }
                );
    }
}
