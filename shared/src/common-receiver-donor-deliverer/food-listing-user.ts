import { AppUserInfo, AppUserType, DateRange } from '../app-user/app-user-info';
import { GPSCoordinate } from "../geocode/gps-coordinate";


/**
 * Container for user information (Either donor, receiver, or deliverer).
 */
export class FoodListingUser extends AppUserInfo {
    
    public constructor (
        email: string = null,
        appUserType: AppUserType = null,
        organizationName: string = null,
        lastName: string = null,
        firstName: string = null,
        address: string = null,
        city: string = null,
        state: string = null,
        zip: number = null,
        gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        utcOffsetMins: number = null,
        phone: string = null,
        availability: DateRange[] = null,
        public drivingDistance: number = null,
        public drivingTime: number = null
    ) {
        super(email, appUserType, organizationName, lastName, firstName,
              address, city, state, zip, gpsCoordinate, utcOffsetMins, phone, availability);
    }
}
