import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';

import { SessionDataService } from '../../common-util/services/session-data.service';

import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/src/receiver-donor/food-listings-filters";
import { AppUserInfo, AppUserType } from "../../../../../shared/src/app-user/app-user-info";


@Component({
    selector: 'food-listing-cart',
    templateUrl: './food-listing-cart.component.html',
    styleUrls: ['./food-listing-cart.component.css']
})
export class FoodListingCartComponent {

    // Need to declare LISTINGS_STATUS enum inside component to be used in the HTML template!
    public readonly LISTINGS_STATUS: typeof LISTINGS_STATUS = LISTINGS_STATUS;

    public additionalFilters: Map <string, AbstractControl>;


    public constructor (
        sessionDataService: SessionDataService
    ) {

        const appUserInfo: AppUserInfo = sessionDataService.getAppUserSessionData();
        const listingsStatus: LISTINGS_STATUS = (appUserInfo.appUserType === AppUserType.Receiver) ? LISTINGS_STATUS.myClaimedListings
                                                                                                   : LISTINGS_STATUS.myDonatedListings;

        this.additionalFilters = new Map <string, AbstractControl>([
            [ 'listingsStatus', new FormControl(listingsStatus) ]
        ]);
    }


    /**
     * Gets the title of the listings based on the listings status (cart type).
     * @param filters The filters value.
     */
    public getListingsTitle(filters: FoodListingsFilters): string {
        return (filters.listingsStatus === LISTINGS_STATUS.myClaimedListings ? 'Claimed Food'
                                                                             : 'Donated Food');
    }


    /**
     * Determines if the cart type is claimed cart.
     * @param filters The filters value to determine the cart type from.
     * @return true if claimed cart, false if not.
     */
    public isClaimedCart(filters: FoodListingsFilters): boolean {
        return ( filters.listingsStatus === LISTINGS_STATUS.myClaimedListings );
    }


    /**
     * Determines if the cart type is donated cart.
     * @param filters The filters value to determine the cart type from.
     * @return true if donated cart, false if not.
     */
    public isDonatedCart(filters: FoodListingsFilters): boolean {
        return ( filters.listingsStatus === LISTINGS_STATUS.myDonatedListings );
    }
}
