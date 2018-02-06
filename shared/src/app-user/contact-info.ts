import { GPSCoordinate } from "../geocode/gps-coordinate";
export { GPSCoordinate };


export class ContactInfo {

    public constructor (
        public address: string = null,
        public city: string = null,
        public state: string = null,
        public zip: number = null,
        public gpsCoordinate: GPSCoordinate = new GPSCoordinate(),
        public utcOffsetMins: number = null,
        public phone: string = null,
        public drivingDistance?: number,
        public drivingTime?: number
    ) {}
}
