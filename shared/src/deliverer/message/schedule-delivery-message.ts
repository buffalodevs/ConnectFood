import { Deserializer } from "../../deserialization/deserializer";

/**
 * Expected request for scheduling a delivery.
 */
export class ScheduleDeliveryRequest {
    
    public constructor (
        /**
         * The key identifier of the claim that is to be scheduled for delivery.
         */
        public claimInfoKey: number,
        /**
         * Set to true if the delivery should be automatically started now. Set false if it should be scheduled for future time.
         */
        public startImmediately: boolean,
        /**
         * The scheduled start time for the delivery. If startImmediately is set true, then this field may be omitted (null).
         */
        public scheduledStartTime?: Date
    ) {}
}
