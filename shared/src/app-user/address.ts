import { GPSCoordinate } from "../geocode/gps-coordinate";


export interface Address {
    address?: string;
    city?: string;
    state?: string;
    zip?: number;
    gpsCoordinate?: GPSCoordinate;
}
