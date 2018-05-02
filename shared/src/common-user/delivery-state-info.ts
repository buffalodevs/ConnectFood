import { deserializable, deepDeserializable } from "../deserialization/deserializer";
import { DeliveryState } from "./food-listing-domain/delivery-state";

export { DeliveryState };


/**
 * Contains information pertaining to a delivery for a claim on a food listing.
 */
@deserializable('DeliveryStateInfo')
export class DeliveryStateInfo {
    
    @deepDeserializable(Date)
    public scheduledStartTime: Date;

    @deepDeserializable(Date)
    public startTime: Date;

    @deepDeserializable(Date)
    public pickUpTime: Date;

    @deepDeserializable(Date)
    public dropOffTime: Date;


    public constructor (
        public deliveryState: DeliveryState = null,
        scheduledStartTime: Date = null,
        startTime: Date = null,
        pickUpTime: Date = null,
        dropOffTime: Date = null
    ) {
        this.scheduledStartTime = scheduledStartTime;
        this.startTime = startTime;
        this.pickUpTime = pickUpTime;
        this.dropOffTime = dropOffTime;
    }
}
