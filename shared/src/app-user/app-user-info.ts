import { GPSCoordinate } from '../geocode/gps-coordinate';
import { DateRange } from '../date-time-util/date-range';
import { AppUserType } from './app-user-type';
import { Address } from './address';
import { deserializable, deepDeserializable } from '../deserialization/deserializer';

export { DateRange, AppUserType, Address, GPSCoordinate };


/**
 * Encapsulates information pertaining to an AppUser that is shared between client and server.
 */
@deserializable('AppUserInfo')
export class AppUserInfo implements Address {

    @deepDeserializable(DateRange)
    public availability: DateRange[];

    
    public constructor (
        public email: string = null,
        public appUserType: AppUserType = null,
        public organizationName: string = null,
        public lastName: string = null,
        public firstName: string = null,
        public address: string = null,
        public city: string = null,
        public state: string = null,
        public zip: number = null,
        public gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        public utcOffsetMins: number = null,
        public phone: string = null,
        availability: DateRange[] = null,
        public taxId: string = null
    ) {
        this.availability = availability;
    }
}
