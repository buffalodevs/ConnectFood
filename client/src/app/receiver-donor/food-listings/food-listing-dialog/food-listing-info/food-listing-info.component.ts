import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';

import { FoodListing } from './../../../../../../../shared/receiver-donor/food-listing';


@Component({
    selector: 'food-listing-info',
    templateUrl: './food-listing-info.component.html',
    styleUrls: ['./food-listing-info.component.css', '../../food-listings.component.css']
})
export class FoodListingInfoComponent {

    private readonly FOOD_LISTING_USER_ACCESSORS: string[];
    private readonly FOOD_LISTING_USER_TITLES: string[];

    @Input() private foodListing: FoodListing;
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean;

    /**
     * Emitted whenever a Food Listing is to be claimed.
     */
    @Output() private toClaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be unclaimed.
     */
    @Output() private toUnclaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be removed (un-donated).
     */
    @Output() private toRemove: EventEmitter<void>;


    public constructor (
        private responsiveService: ResponsiveService
    ) {
        this.FOOD_LISTING_USER_ACCESSORS = [ 'donorInfo', 'claimInfo.receiverInfo', 'claimInfo.delivererInfo' ];
        this.FOOD_LISTING_USER_TITLES = [ 'Donor', 'Receiver', 'Deliverer' ];

        this.isClaimedCart = false;
        this.isDonatedCart = false;

        this.toClaim = new EventEmitter<void>();
        this.toUnclaim = new EventEmitter<void>();
        this.toRemove = new EventEmitter<void>();
    }


    /**
     * Determines whether or not to show user information pertaining to a given Food Listing User (Receiver, Donor, or Deliverer).
     * @param foodListingUserAccessor The accessor for the Food Listing User (from the FOOD_LISTING_USER_ACCESSORS array instance).
     * @return true if the user info should be shown, false if not.
     */
    private shouldShowFoodListingUser(foodListingUserAccessor: string): boolean {

        return (    (foodListingUserAccessor != 'donorInfo' || !this.isDonatedCart)
                &&  (foodListingUserAccessor != 'claimInfo.receiverInfo' || this.isDonatedCart)
                &&  (foodListingUserAccessor != 'claimInfo.delivererInfo' || this.isDonatedCart || this.isClaimedCart) );
    }
}
