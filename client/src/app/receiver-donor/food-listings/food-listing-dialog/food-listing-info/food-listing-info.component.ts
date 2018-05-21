import { Component, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

import { DateFormatterService } from '../../../../common-util/services/date-formatter.service';
import { ResponsiveService } from '../../../../common-util/services/responsive.service';
import { DEFAULT_IMG_URL } from '../../../../common-util/directives/default-img.directive';

import { FoodListing } from './../../../../../../../shared/src/common-user/food-listing';
import { AppUser } from '../../../../../../../shared/src/app-user/app-user';
import { ImgCropConstants } from '../../../../../../../shared/src/img/img-crop-constants';


@Component({
    selector: 'food-listing-info',
    templateUrl: './food-listing-info.component.html',
    styleUrls: ['./food-listing-info.component.css', '../../food-listings.component.css']
})
export class FoodListingInfoComponent {

    // Make this available to HTML Template.
    public readonly IMG_CROP_CONSTANTS: ImgCropConstants = new ImgCropConstants();
    public readonly DEFAULT_IMG_URL: string = DEFAULT_IMG_URL;
    public readonly FOOD_LISTING_USER_ACCESSORS: string[] = [ 'donorInfo', 'claimInfo.receiverInfo', 'claimInfo.deliveryInfo.delivererInfo' ];
    public readonly FOOD_LISTING_USER_TITLES: string[] = [ 'Donor', 'Receiver', 'Deliverer' ];

    @Input() public foodListing: FoodListing = null;
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() public isClaimedCart: boolean = false;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() public isDonatedCart: boolean = false;

    /**
     * Emitted whenever a Food Listing is to be claimed.
     */
    @Output() public toClaim: EventEmitter<void> = new EventEmitter<void>();
    /**
     * Emitted whenever a Food Listing is to be unclaimed.
     */
    @Output() public toUnclaim: EventEmitter<void> = new EventEmitter<void>();
    /**
     * Emitted whenever a Food Listing is to be removed (un-donated).
     */
    @Output() public toRemove: EventEmitter<void> = new EventEmitter<void>();


    public constructor (
        public responsiveService: ResponsiveService,
        public dateFormatter: DateFormatterService
    ) {}


    /**
     * Determines whether or not to show user information pertaining to a given Food Listing User (Receiver, Donor, or Deliverer).
     * @param foodListingUserAccessor The accessor for the Food Listing User (from the FOOD_LISTING_USER_ACCESSORS array instance).
     * @return true if the user info should be shown, false if not.
     */
    public shouldShowFoodListingUser(foodListingUserAccessor: string): boolean {

        return (    (foodListingUserAccessor != 'donorInfo' || !this.isDonatedCart)
                &&  (foodListingUserAccessor != 'claimInfo.receiverInfo' || this.isDonatedCart)
                &&  (foodListingUserAccessor != 'claimInfo.deliveryInfo.delivererInfo' || this.isDonatedCart || this.isClaimedCart) );
    }


    /**
     * Gets the Food Listing User associated with a given accessor string.
     * @param foodListingUserAccessor The accessor string associated with the user.
     * @return The Food Listing User.
     */
    public getFoodListingUser(foodListingUserAccessor: string): AppUser {
        return _.get(this.foodListing, foodListingUserAccessor);
    }
}
