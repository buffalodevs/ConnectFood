import { EnumManipulation } from "../../common-util/enum-manipulation";


/**
 * Defines possible App User types.
 */
export enum AppUserType {
    Receiver = 'Receiver',
    Donor = 'Donor',
    Deliverer = 'Deliverer'
}


export const APP_USER_TYPE_VALUES: string[] = EnumManipulation.getEnumValues(AppUserType);
