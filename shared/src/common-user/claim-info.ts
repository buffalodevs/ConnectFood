import { deserializable, deepDeserializable } from '../deserialization/deserializer';
import { AppUser, DateRange } from '../app-user/app-user';
import { DeliveryInfo } from './delivery-info';


/**
 * Contains information pertaining to a claim on a food listing.
 */
@deserializable('ClaimInfo')
export class ClaimInfo {

    @deepDeserializable(AppUser)        public receiverInfo: AppUser;
    @deepDeserializable(DateRange)      public claimAvailability: DateRange[];
    @deepDeserializable(DateRange)      public possibleDeliveryTimes: DateRange[];
    @deepDeserializable(DeliveryInfo)   public deliveryInfo: DeliveryInfo;


    public constructor (
        public claimInfoKey: number = null,
        receiverInfo: AppUser = null,
        claimAvailability: DateRange[] = null,
        possibleDeliveryTimes: DateRange[] = null,
        deliveryInfo: DeliveryInfo = null
    ) {
        this.receiverInfo = receiverInfo;
        this.claimAvailability = claimAvailability;
        this.possibleDeliveryTimes = possibleDeliveryTimes;
        this.deliveryInfo = deliveryInfo;
    }
}