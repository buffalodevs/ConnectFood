import { DeliveryFilters } from '../delivery-filters';
export { DeliveryFilters };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { Delivery, DeliveryState } from "../delivery";
export { Delivery, DeliveryState };

import { SlickListResponse } from '../../../client/src/app/misc-slick-components/slick-filtered-list/slick-list/slick-list-message/slick-list-response';
import { SlickListRequest } from '../../../client/src/app/misc-slick-components/slick-filtered-list/slick-list/slick-list-message/slick-list-request';


/**
 * The expected request for the get deliveries operation. Should be sent from the client to the server.
 */
export class GetDeliveriesRequest extends SlickListRequest <DeliveryFilters> {

    public constructor (
        /**
         * Filters to use when getting food listings.
         */
        filters: DeliveryFilters
    ) {
        super(filters);
    }
}


/**
 * The expected response from the get deliveries operation. Should be sent form the server to the client.
 */
export class GetDeliveriesResponse extends SlickListResponse <Delivery> {

    public constructor (
        /**
         * The food listing delivery data that were retrieved during the server operation.
         */
        dataList?: Delivery[],
        /**
         * Indicates whether or not the operation on the back end was successful.
         */
        success?: boolean,
        /**
         * A message containing information pertaining to what happened during processing on the back end. If successful, then it should
         * contain a simple success message. If unsuccessful, then it should contain the error message (without leaking sensitive data).
         */
        message?: string,
        /**
         * Indicates if there is a need for the user to login to perform the related operation on the server.
         */
        loginRequired: boolean = false,
        /**
         * Indicates if there is a need for the user to have their signup confirmed before performing certain functionality.
         */
        signupConfirmRequired: boolean = false
    ) {
        super(dataList, success, message, loginRequired, signupConfirmRequired);
    }
}
