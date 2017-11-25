import { GPSCoordinate } from '../common-util/geocode';
import { TimeRange } from './time-range';

export { TimeRange };


export enum AppUserType {
    Receiver,
    Donor,
    Driver
}


export interface Address {
    address?: string;
    city?: string;
    state?: string;
    zip?: number;
    gpsCoordinate?: GPSCoordinate;
}


/**
 * Encapsulates information pertaining to an AppUser that is shared between client and server.
 */
export class AppUserInfo implements Address {
    
    public constructor (
        public email?: string,
        public appUserType?: AppUserType,
        public organizationName?: string,
        public lastName?: string,
        public firstName?: string,
        public address?: string,
        public city?: string,
        public state?: string,
        public zip?: number,
        public gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        public phone?: string,
        public availability?: TimeRange[]
    ) { }
}
