import { DeliveryFilters } from '../delivery-filters';
export { DeliveryFilters };

import { FoodWebResponse } from '../../message-protocol/food-web-response';
import { Delivery, DeliveryState } from "../delivery";
export { Delivery, DeliveryState };

import { GetListingsResponse } from '../../slick-list/message/slick-list-response';
import { GetListingsRequest } from '../../slick-list/message/slick-list-request';
import { Deserializer } from '../../deserialization/deserializer';
import { deserializable, deepDeserializable } from '../../deserialization/deserializable-registration/deserializable-annotations';


/**
 * The expected request for the get deliveries operation. Should be sent from the client to the server.
 */
export class GetDeliveriesRequest implements GetListingsRequest <DeliveryFilters> {
    
    public constructor (
        /**
         * Filters to use when getting food listings.
         */
        public filters: DeliveryFilters
    ) {}
}


/**
 * The expected response from the get deliveries operation. Should be sent form the server to the client.
 */
@deserializable('GetDeliveriesResponse')
export class GetDeliveriesResponse extends GetListingsResponse <Delivery> {

    @deepDeserializable(Delivery)
    public listData: Delivery[];


    public constructor (
        /**
         * The food listing delivery data that were retrieved during the server operation.
         */
        listData: Delivery[] = null,
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
        super(listData, success, message, loginRequired, signupConfirmRequired);
        this.listData = listData;
    }
}
