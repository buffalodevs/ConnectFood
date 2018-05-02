import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/finally';

import { ManageFoodListingService } from '../../food-listing-services/manage-food-listing.service';
import { FoodListing } from './../../../../../../../shared/src/common-user/food-listing';


@Component({
    selector: 'food-listing-remove',
    templateUrl: './food-listing-remove.component.html',
    styleUrls: ['./food-listing-remove.component.css']
})
export class FoodListingRemoveComponent {

    @Input() public foodListing: FoodListing;

    /**
     * Emitted whenever the dialog should close.
     */
    @Output() public close: EventEmitter <void>;
    /**
     * Emitted whenever a Food Listing has been completely removed on server and should be removed fromt he parent components list (Cart).
     */
    @Output() public removeListing: EventEmitter <void>;

    public removeForm: FormGroup;
    public removeComplete: boolean;
    public showProgressSpinner: boolean;
    public errMsg: string;


    public constructor (
        private _manageFoodListingService: ManageFoodListingService
    ) {
        this.removeListing = new EventEmitter <void>();
        this.close = new EventEmitter <void>();

        this.removeForm = new FormGroup({ removalReason: new FormControl(null, Validators.required) });
        this.removeComplete = false;
        this.showProgressSpinner = false;
        this.errMsg = null;
    }


    /**
     * Removes (un-donates) the currently selected Food Listing.
     */
    public removeSelectedFoodListing(): void {
        
        if (!this.removeForm.valid) return;
        
        const removalReason: string = this.removeForm.get('removalReason').value;
        let observer: Observable <void> = this._manageFoodListingService.removeFoodListing(this.foodListing.foodListingKey, removalReason);
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
