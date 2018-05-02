import { EnumManipulation } from "../../common-util/enum-manipulation";


/**
 * Types of vehicle (sizes) that are recommended for delivery of an associated food listing.
 */
export enum VehicleType {
    sedan           = 'Sedan',
    suv             = 'SUV',
    van             = 'Van',
    commercialTruck = 'Commercial Truck'
}


export const VEHICLE_TYPE_VALUES: string[] = EnumManipulation.getEnumValues(VehicleType);
