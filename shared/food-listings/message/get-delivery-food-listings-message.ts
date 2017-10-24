import { DeliveryFoodListingsFilters } from '../delivery-food-listings-filters';
export { DeliveryFoodListingsFilters };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { DeliveryFoodListing } from "../../food-listings/delivery-food-listing";
export { DeliveryFoodListing };

import { SlickListResponse } from '../../../client/src/app/slick-list/slick-list-message/slick-list-response';
import { SlickListRequest } from '../../../client/src/app/slick-list/slick-list-message/slick-list-request';


/**
 * The expected request for the get delivery food listings operation. Should be sent from the client to the server.
 */
export class GetDeliveryFoodListingsRequest extends SlickListRequest<DeliveryFoodListingsFilters> {

    constructor (
        /**
         * Filters to use when getting food listings.
         */
        public filters: DeliveryFoodListingsFilters
    ) {
        super(filters);
    }
}


/**
 * The expected response from the get food listings operation. Should be sent form the server to the client.
 */
export class GetDeliveryFoodListingsResponse extends SlickListResponse <DeliveryFoodListing> {

    constructor (
        /**
         * The delivery food listings that were retrieved during the server operation.
         */
        public dataList?: DeliveryFoodListing[],
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        public success?: boolean,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        public message?: string,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        public loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        public signupConfirmRequired: boolean = false
    ) {
        super(dataList, success, message, loginRequired, signupConfirmRequired);
    }
}
