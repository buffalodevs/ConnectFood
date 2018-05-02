import { FoodListingFilters } from '../food-listing-filters';
export { FoodListingFilters };

import { FoodListing } from "../food-listing";
export { FoodListing };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { GetListingsRequest } from '../../slick-list/message/slick-list-request';
import { GetListingsResponse } from '../../slick-list/message/slick-list-response';
import { Deserializer, deserializable, deepDeserializable } from '../../deserialization/deserializer';


/**
 * The expected request for the get food listing filters operation. Should be sent from the client to the server.
 */
export class GetFoodListingFiltersRequest {

    public constructor (
        /**
         * The key ID of the filters to retrieve.
         */
        public foodListingFiltersKey: number = null,
        /**
         * Set to true if Food Listings corresponding to the retrieved filters should also be retrieved. Otherwise, set false (DEFAULT) for filters only.
         */
        public getFoodListings: boolean = false
    ) {}
}


/**
 * The expected response from the get food listing filters operation. Should be sent form the server to the client.
 */
@deserializable('GetFoodListingFiltersResponse')
export class GetFoodListingFiltersResponse extends FoodWebResponse {

    @deepDeserializable(FoodListingFilters)
    public filters: FoodListingFilters;

    @deepDeserializable(FoodListing)
    public listData: FoodListing[];


    public constructor (
        /**
         * The food listing filters that were retrieved during the server operation.
         */
        filters: FoodListingFilters = null,
        /**
         * The optional food listings that were retrieved based on retrieved filters during the server operation.
         */
        listData: FoodListing[] = null,
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        success: boolean = null,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        message: string = null,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        signupConfirmRequired: boolean = false
    ) {
        super(success, message, loginRequired, signupConfirmRequired);
        this.filters = filters;
        this.listData = listData;
    }
}
