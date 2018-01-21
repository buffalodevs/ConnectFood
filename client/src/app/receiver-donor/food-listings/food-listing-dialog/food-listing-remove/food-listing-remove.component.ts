import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-remove',
    templateUrl: './food-listing-remove.component.html',
    styleUrls: ['./food-listing-remove.component.css']
})
export class FoodListingRemoveComponent {

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
    private errMsg: string;


    public constructor (
        private responsiveService: ResponsiveService,
        private manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter<void>();
        this.close = new EventEmitter<void>();

        this.removeForm = new FormGroup({ removalReason: new FormControl(null, Validators.required) });
        this.removeComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Removes (un-donates) the currently selected Food Listing.
     */
    private removeSelectedFoodListing(): void {
        
        if (!this.removeForm.valid) return;
        
        const removalReason: string = this.removeForm.get('removalReason').value;
        let observer: Observable <void> = this.manageFoodListingService.removeFoodListing(this.foodListing.foodListingKey, removalReason);
        this.showProgressSpinner = true;
        
        // Listen for result.
        observer.finally(() => {
                    this.removeComplete = true;
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
