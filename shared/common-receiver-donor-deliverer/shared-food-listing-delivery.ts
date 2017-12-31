import { AppUserInfo, TimeRange, AppUserType } from '../app-user/app-user-info';
import { GPSCoordinate } from "../common-util/geocode";


/**
 * Container for user information (Either donor, receiver, or deliverer).
 */
export class FoodListingUser extends AppUserInfo {
    
    public constructor (
        email?: string,
        appUserType?: AppUserType,
        organizationName?: string,
        lastName?: string,
        firstName?: string,
        address?: string,
        city?: string,
        state?: string,
        zip?: number,
        gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        phone?: string,
        availability?: TimeRange[],
        public drivingDistance?: number,
        public drivingTime?: number
    ) {
        super(email, appUserType, organizationName, lastName, firstName,
              address, city, state, zip, gpsCoordinate, phone, availability);
    }
}


/**
 * The state (implies location) of the Delivery Food Listing
 */
export enum DeliveryState {
    unscheduled = 'unscheduled',
    scheduled = 'scheduled',
    started = 'started',
    pickedUp = 'pickedUp',
    droppedOff = 'droppedOff'
}


/**
 * Contains information pertaining to a delivery for a claim on a food listing.
 */
export class DeliveryStateInfo {
    
    public constructor (
        public deliveryState?: DeliveryState,
        public scheduledStartTime?: Date,
        public startTime?: Date,
        public pickUpTime?: Date,
        public dropOffTime?: Date
    ) {}
}
