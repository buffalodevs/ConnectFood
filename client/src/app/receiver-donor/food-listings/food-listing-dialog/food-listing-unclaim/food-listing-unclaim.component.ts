import { Component, Input, ViewChild, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';
import { FoodListing } from './../../../../../../../shared/src/common-user/food-listing';


@Component({
    selector: 'food-listing-unclaim',
    templateUrl: './food-listing-unclaim.component.html',
    styleUrls: ['./food-listing-unclaim.component.css']
})
export class FoodListingUnclaimComponent {

    @Input() public foodListing: FoodListing;

    /**
     * Emitted whenever the dialog should close.
     */
    @Output() public close: EventEmitter <void>;
    /**
     * Emitted whenever a Food Listing has been completely unclaimed and should be removed fromt he parent components list (Cart).
     */
    @Output() public removeListing: EventEmitter <void>;

    public unclaimForm: FormGroup;
    public unclaimComplete: boolean;
    public showProgressSpinner: boolean;
    public errMsg: string;


    public constructor (
        private _manageFoodListingService: ManageFoodListingService
    ) {
        this.close = new EventEmitter <void>();
        this.removeListing = new EventEmitter <void>();

        this.unclaimForm = new FormGroup({ unclaimReason: new FormControl(null, Validators.required) });
        this.unclaimComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Unclaims the currently selected Food Listing.
     */
    public unclaimSelectedFoodListing(): void {

        if (!this.unclaimForm.valid) return;
        
        const unclaimReason: string = this.unclaimForm.get('unclaimReason').value;
        let observer: Observable <void> = this._manageFoodListingService.unclaimFoodListing(this.foodListing.foodListingKey, unclaimReason);
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
