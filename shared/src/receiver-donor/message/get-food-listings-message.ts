import { FoodListingsFilters } from '../food-listings-filters';
export { FoodListingsFilters };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { FoodListing } from "../food-listing";
export { FoodListing };

import { GetListingsRequest } from '../../slick-list/message/slick-list-request';
import { GetListingsResponse } from '../../slick-list/message/slick-list-response';
import { Deserializer } from '../../deserialization/deserializer';


/**
 * The expected request for the get food listings operation. Should be sent from the client to the server.
 */
export class GetFoodListingsRequest implements GetListingsRequest <FoodListingsFilters> {

    public constructor (
        /**
         * Filters to use when getting food listings.
         */
        public filters: FoodListingsFilters = null
    ) {}
}


/**
 * The expected response from the get food listings operation. Should be sent form the server to the client.
 */
export class GetFoodListingsResponse extends GetListingsResponse <FoodListing> {

    public constructor (
        /**
         * The food listings that were retrieved during the server operation.
         */
        public listData: FoodListing[] = null,
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        public success: boolean = null,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        public message: string = null,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        public loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        public signupConfirmRequired: boolean = false
    ) {
        super(listData, success, message, loginRequired, signupConfirmRequired);
    }
}
