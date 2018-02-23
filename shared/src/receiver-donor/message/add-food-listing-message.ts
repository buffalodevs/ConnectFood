import { deserializable, deepDeserializable } from '../../deserialization/deserializer';
import { FoodWebResponse } from '../../message-protocol/food-web-response'
import { FoodListing } from '../../common-receiver-donor-deliverer/food-listing';

export { FoodListing };


@deserializable('AddFoodListingRequest')
export class AddFoodListingRequest {
    
    @deepDeserializable(FoodListing)
    public foodListing: FoodListing;


    public constructor (
        foodListing: FoodListing = null
    ) {
        this.foodListing = foodListing;
    }
}


export class AddFoodListingResponse extends FoodWebResponse {
    
    public constructor (
        /**
         * The key of the added food listing. Can be used to edit the added listing.
         */
        public foodListingKey: number = null,
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
        super(success, message, loginRequired, signupConfirmRequired);
    }
}
