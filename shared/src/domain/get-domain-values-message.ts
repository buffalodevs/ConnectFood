import { FoodWebResponse } from '../message-protocol/food-web-response';


export class GetDomainValuesRequest {

    public constructor (
        /**
         * The name of the domain of which to get the values of.
         */
        public domainName: string
    ) { }
}


/**
 * The expected response from the server after the get domain values operation.
 */
export class GetDomainValuesResponse extends FoodWebResponse {

    public constructor (
        /**
         * A list of domain values retrieved on the server.
         */
        public domainValues: string[] = null,
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
