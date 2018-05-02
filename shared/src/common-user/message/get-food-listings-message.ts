import { FoodListingFilters } from '../food-listing-filters';
export { FoodListingFilters };

import { FoodListing } from "../food-listing";
export { FoodListing };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { GetListingsRequest } from '../../slick-list/message/slick-list-request';
import { GetListingsResponse } from '../../slick-list/message/slick-list-response';
import { Deserializer, deserializable, deepDeserializable } from '../../deserialization/deserializer';


/**
 * The expected request for the get food listings operation. Should be sent from the client to the server.
 */
@deserializable('GetFoodListingsRequest')
export class GetFoodListingsRequest implements GetListingsRequest <FoodListingFilters> {

    @deepDeserializable(FoodListingFilters)
    public filters: FoodListingFilters;


    public constructor (
        /**
         * Filters to use when getting food listings.
         */
        filters: FoodListingFilters = null
    ) {
        this.filters = filters;
    }
}


/**
 * The expected response from the get food listings operation. Should be sent form the server to the client.
 */
@deserializable('GetFoodListingsResponse')
export class GetFoodListingsResponse extends GetListingsResponse <FoodListing> {

    @deepDeserializable(FoodListing)
    public listData: FoodListing[];


    public constructor (
        /**
         * The food listings that were retrieved during the server operation.
         */
        listData: FoodListing[] = null,
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
        this.listData = listData;
    }
}
