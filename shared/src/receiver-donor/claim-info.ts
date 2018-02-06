import { deserializable, deepDeserializable } from '../deserialization/deserializer';
import { AppUser } from '../app-user/app-user';
import { DeliveryStateInfo } from '../common-receiver-donor-deliverer/delivery-state-info';


/**
 * Contains information pertaining to a claim on a food listing.
 */
@deserializable('ClaimInfo')
export class ClaimInfo {

    @deepDeserializable(DeliveryStateInfo)
    public deliveryStatInfo: DeliveryStateInfo;


    public constructor (
        public receiverInfo: AppUser = null,
        public delivererInfo: AppUser = null,
        deliveryStateInfo: DeliveryStateInfo = null
    ) {
        this.deliveryStatInfo = deliveryStateInfo;
    }
}