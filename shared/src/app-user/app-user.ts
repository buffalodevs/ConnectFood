import { DateRange } from '../date-time-util/date-range';
import { AppUserType } from './app-user-domain/app-user-type';
import { deserializable, deepDeserializable } from '../deserialization/deserializer';
import { ContactInfo, GPSCoordinate } from './contact-info';
import { Organization } from './organization';

export { DateRange, AppUserType, ContactInfo, GPSCoordinate, Organization };


/**
 * Encapsulates information pertaining to an AppUser that is shared between client and server.
 */
@deserializable('AppUser')
export class AppUser {

    @deepDeserializable(DateRange)
    public availability: DateRange[];

    
    public constructor (
        public email: string = null,
        public appUserType: AppUserType = null,
        public lastName: string = null,
        public firstName: string = null,
        public contactInfo: ContactInfo = new ContactInfo(),
        public organization: Organization = new Organization(),
        availability: DateRange[] = null
    ) {
        this.availability = availability;
    }


    /**
     * Returns whether or not this user is an organization (not an individual).
     */
    public isOrganization(): boolean {
        return ( this.appUserType !== AppUserType.Deliverer );
    }
}
