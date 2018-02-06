import { DateRange } from '../date-time-util/date-range';
import { deserializable, deepDeserializable } from '../deserialization/deserializer';

export { DateRange };


export enum AvailabilityType {
    /**
     * Regular weekly availability contains Date Ranges that only contain meaningful weekday and time information. The calendar dates are only present to provide weekday.
     */
    regularWeekly,
    /**
     * Regular weekly overlaod avaialbility contains Date Ranges that have meaningful absolute dates. 
     */
    regularWeeklyOverload,
    reqularWeeklyOverride
}


/**
 * Encapsulates information pertaining to an AppUser that is shared between client and server.
 */
@deserializable('AppUserAvailability')
export class AppUserAvailability {

    @deepDeserializable(DateRange)
    public timeRanges: DateRange[];

    
    public constructor (
        public availabilityType: AvailabilityType = null,
        timeRanges: DateRange[] = null
    ) {
        this.timeRanges = timeRanges;
    }
}
