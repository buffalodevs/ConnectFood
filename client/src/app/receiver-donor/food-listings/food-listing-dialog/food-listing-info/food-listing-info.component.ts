import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';
import { ResponsiveService } from '../../../../common-util/services/responsive.service';

import { FoodListing } from './../../../../../../../shared/src/receiver-donor/food-listing';
import { AppUser } from '../../../../../../../shared/src/app-user/app-user';


@Component({
    selector: 'food-listing-info',
    templateUrl: './food-listing-info.component.html',
    styleUrls: ['./food-listing-info.component.css', '../../food-listings.component.css']
})
export class FoodListingInfoComponent {

    public readonly FOOD_LISTING_USER_ACCESSORS: string[];
    public readonly FOOD_LISTING_USER_TITLES: string[];

    @Input() public foodListing: FoodListing;
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() public isClaimedCart: boolean;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() public isDonatedCart: boolean;

    /**
     * Emitted whenever a Food Listing is to be claimed.
     */
    @Output() public toClaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be unclaimed.
     */
    @Output() public toUnclaim: EventEmitter<void>;
    /**
     * Emitted whenever a Food Listing is to be removed (un-donated).
     */
    @Output() public toRemove: EventEmitter<void>;


    public constructor (
        public responsiveService: ResponsiveService,
        public dateFormatter: DateFormatterService
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


    /**
     * Gets the Food Listing User associated with a given accessor string.
     * @param foodListingUserAccessor The accessor string associated with the user.
     * @return The Food Listing User.
     */
    private getFoodListingUser(foodListingUserAccessor: string): AppUser {
        return _.get(this.foodListing, foodListingUserAccessor);
    }
}
