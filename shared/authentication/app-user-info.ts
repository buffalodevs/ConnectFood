import { GPSCoordinate } from '../common-util/geocode';


/**
 * Encapsulates information pertaining to an AppUser that is shared between client and server.
 */
export class AppUserInfo {
    
    constructor (
        public email?: string,
        public organizationName?: string,
        public lastName?: string,
        public firstName?: string,
        public address?: string,
        public city?: string,
        public state?: string,
        public zip?: number,
        public gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        public phone?: string,
        public isDonor?: boolean,
        public isReceiver?: boolean
    ) { }
}
