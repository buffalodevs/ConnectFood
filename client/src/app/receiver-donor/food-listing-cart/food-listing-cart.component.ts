import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';

import { SessionDataService } from '../../common-util/services/session-data.service';

import { FoodListingFilters, FoodListingsStatus, } from "../../../../../shared/src/common-user/food-listing-filters";
import { AppUser, AppUserType } from "../../../../../shared/src/app-user/app-user";


@Component({
    selector: 'food-listing-cart',
    templateUrl: './food-listing-cart.component.html',
    styleUrls: ['./food-listing-cart.component.css']
})
export class FoodListingCartComponent {

    // Need to declare LISTINGS_STATUS enum inside component to be used in the HTML template!
    public readonly FoodListingsStatus: typeof FoodListingsStatus = FoodListingsStatus;

    public additionalFilters: Map <string, AbstractControl>;


    public constructor (
        sessionDataService: SessionDataService
    ) {

        const appUser: AppUser = sessionDataService.getAppUserSessionData();
        const listingsStatus: FoodListingsStatus = (appUser.appUserType === AppUserType.Receiver) ? FoodListingsStatus.myClaimedListings
                                                                                                  : FoodListingsStatus.myDonatedListings;

        this.additionalFilters = new Map <string, AbstractControl>([
            [ 'foodListingsStatus', new FormControl(listingsStatus) ]
        ]);
    }


    /**
     * Gets the title of the listings based on the listings status (cart type).
     * @param filters The filters value.
     */
    public getListingsTitle(filters: FoodListingFilters): string {
        return (filters.foodListingsStatus === FoodListingsStatus.myClaimedListings ? 'Claimed Food'
                                                                                    : 'Donated Food');
    }


    /**
     * Determines if the cart type is claimed cart.
     * @param filters The filters value to determine the cart type from.
     * @return true if claimed cart, false if not.
     */
    public isClaimedCart(filters: FoodListingFilters): boolean {
        return ( filters.foodListingsStatus === FoodListingsStatus.myClaimedListings );
    }


    /**
     * Determines if the cart type is donated cart.
     * @param filters The filters value to determine the cart type from.
     * @return true if donated cart, false if not.
     */
    public isDonatedCart(filters: FoodListingFilters): boolean {
        return ( filters.foodListingsStatus === FoodListingsStatus.myDonatedListings );
    }
}
