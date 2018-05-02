import { SessionData } from "../common-util/session-data";
import { DeliveryState } from "../../../shared/src/deliverer/delivery-util";


/**
 * A container for data required to notify users whenever a Delivery is updated.
 */
export class DeliveryUpdateNotificationData {

    public constructor (
        public foodTitle: string,
        public oldDeliveryState: DeliveryState,
        public newDeliveryState: DeliveryState,
        public scheduledStartTime: Date,
        public cancelled: boolean,
        public cancelReason: string,
        public foodRejected: boolean,
        public receiverSessionData: SessionData,
        public donorSessionData: SessionData,
        public delivererSessionData: SessionData
    ) {}
}
