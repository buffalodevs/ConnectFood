import { Delivery, DeliveryState } from './delivery';
import { TimeRange } from '../app-user/time-range';
export { Delivery, DeliveryState };


/**
 * Holds shared Delivery utility (static) methods for client and server.
 */
export class DeliveryUtil {

    // Private constructor for pure static class.
    private constructor() {}


    /**
     * Gets the values of the DeliveryState enum members.
     * @return An array of the Delivery State string values.
     */
    public static getDeliveryStateVals(): string[] {

        let keys: string[] = [];

        for (let property in DeliveryState) {
            if (DeliveryState.hasOwnProperty(property))
            {  keys.push(DeliveryState[property]);  }
        }

        return keys;
    }


    /**
     * Compares two delivery states. This is much like the C language compare method for string comparison. See it for more details.
     * @param lhs The left hand side of the comparison.
     * @param rhs The right hand side of the comparison.
     * @return If lhs < rhs, then any negative number. If lhs > rhs, then any positive number. If lhs == rhs, then 0.
     */
    public static compareDeliveryStates(lhs: DeliveryState, rhs: DeliveryState): number {

        const lhsIndex: number = DeliveryUtil.getDeliveryStateIndex(lhs);
        const rhsIndex: number = DeliveryUtil.getDeliveryStateIndex(rhs);

        return ( lhsIndex - rhsIndex );
    }


    /**
     * Converts a given delivery state into an ordered index related to the logical ordering of states as they occur throughout the delivery process.
     * @param deliveryState The delivery state to generate an index for.
     * @return The index of the delivery state.
     */
    public static getDeliveryStateIndex(deliveryState: DeliveryState): number {

        switch (deliveryState) {
            case DeliveryState.unscheduled: return 0;
            case DeliveryState.scheduled:   return 1;
            case DeliveryState.started:     return 2;
            case DeliveryState.pickedUp:    return 3;
            case DeliveryState.droppedOff:  return 4;
        }

        throw new Error('Incorrect Delivery State provided to getDeliveryStateIndex() method');
    }


    /**
     * Gets a human readable version of a given Delivery State value.
     * @param deliveryState The Delivery State.
     * @return A human readable version of the given Delivery State.
     */
    public static getReadableDeliveryState(deliveryState: DeliveryState): string {

        switch (deliveryState) {
            case DeliveryState.unscheduled: return 'Unscheduled';
            case DeliveryState.scheduled:   return 'Scheduled';
            case DeliveryState.started:     return 'Started';
            case DeliveryState.pickedUp:    return 'Picked Up';
            case DeliveryState.droppedOff:  return 'Dropped Off';
        }

        throw new Error('Incorrect Delivery State provided to getReadableDeliveryState() method');
    }


    /**
     * Custom deserializes any received delivery data before it is displayed/used.
     * Here, we ensure that all JSON ISO string format dates are converted to Date objects.
     * @param deliveryData The received delivery data.
     */
    public static deserializeDeliveryData(deliveryData: Array<Delivery>): void {
        
        for (let i: number = 0; i < deliveryData.length; i++) {

            if (deliveryData[i].possibleDeliveryTimes != null) {
                this.convertJSONStringsToDates(deliveryData[i].possibleDeliveryTimes);
            }
        }
    }


    /**
     * Converts JSON ISO date strings to Date objects.
     * @param possibleDeliveryTimes The possible delivery times containing JSON ISO date strings
     *                              NOTE: This will be internally modified!
     */
    private static convertJSONStringsToDates(possibleDeliveryTimes: TimeRange[]): void {

        for (let i: number = 0; i < possibleDeliveryTimes.length; i++) {
            // Constructing new Time Range will convert any input ISO strings to dates automatically!
            possibleDeliveryTimes[i] = new TimeRange(possibleDeliveryTimes[i].startTime, possibleDeliveryTimes[i].endTime);
        }
    }
}