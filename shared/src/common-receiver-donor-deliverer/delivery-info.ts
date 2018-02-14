import { Deserializer, deserializable, deepDeserializable } from '../deserialization/deserializer';
import { AppUser, DateRange } from '../app-user/app-user';
import { DeliveryStateInfo, DeliveryState } from '../common-receiver-donor-deliverer/delivery-state-info';

export { DeliveryStateInfo, DeliveryState };


/**
 * A single Food Listing Delivery entry that mainly contains data that is relavent to the user when browsing potential deliveries and scheduled/started deliveries.
 */
@deserializable('DeliveryInfo')
export class DeliveryInfo {

    @deepDeserializable(AppUser)            public delivererInfo: AppUser;
    @deepDeserializable(DateRange)          public deliveryAvailability: DateRange[];
    @deepDeserializable(DeliveryStateInfo)  public deliveryStateInfo: DeliveryStateInfo;

    
    public constructor (
        public deliveryInfoKey: number = null,
        delivererInfo: AppUser = null,
        deliveryAvailability: DateRange[] = null,
        deliveryStateInfo: DeliveryStateInfo = null
    ) {
        this.delivererInfo = delivererInfo;
        this.deliveryAvailability = deliveryAvailability;
        this.deliveryStateInfo = deliveryStateInfo;
    }
}
