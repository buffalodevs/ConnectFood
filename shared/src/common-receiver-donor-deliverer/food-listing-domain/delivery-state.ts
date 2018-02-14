import { EnumManipulation } from "../../common-util/enum-manipulation";


/**
 * The state (implies location) of the Delivery Food Listing
 */
export enum DeliveryState {
    unscheduled =   'Unscheduled',
    scheduled =     'Scheduled',
    started =       'Started',
    pickedUp =      'Picked Up',
    droppedOff =    'Dropped Off'
}


export const DELIVERY_STATE_VALUES: string[] = EnumManipulation.getEnumValues(DeliveryState);
