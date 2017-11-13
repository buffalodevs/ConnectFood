import { Component, OnInit, Input } from '@angular/core';

import { DateFormatter } from '../../../../shared/common-util/date-formatter';
import { TimeRange } from '../../../../shared/app-user/time-range';


@Component({
    selector: 'slick-weekday-scheduler',
    templateUrl: './slick-weekday-scheduler.component.html',
    styleUrls: ['./slick-weekday-scheduler.component.css']
})
export class SlickWeekdaySchedulerComponent implements OnInit {

    /**
     * The time ranges that times can be selected within. If not set, then all times can be selected.
     * NOTE: Input timeRanges should be sorted for best performance.
     * TODO: Sort internally in future (may be uneeded optimization)!
     */
    @Input() private timeRanges: TimeRange[];


    public constructor() { }

    public ngOnInit(): void {
        // TODO: Sort timeRanges so that binary search can be performed below (probably overkill and not needed)!
    }


    /**
     * Checks if a given time is within the parent inputted time ranges and may be displayed.
     * @param weekday The (case insensitive) weekday [Sunday, Saturday] of the time to check.
     * @param time The wall clock time (hh:mm ['AM' | 'PM']).
     * @return true if the time is in a valid range and can be displayed, false if not.
     */
    private isTimeInValidRange(weekday: string, time: string): boolean {

        // If no time range constraints set, then simply return true for valid.
        if (this.timeRanges == null)  return true;

        const timeToCheckMs: number = DateFormatter.convertWeekdayTimeToDate(weekday, time).getTime();

        for (let i: number = 0; i < this.timeRanges.length; i++) {

            // Extract time data from range.
            const startTimeMs: number = this.timeRanges[i].startTime.getTime();
            const endTimeMs: number = this.timeRanges[i].endTime.getTime();
            
            // If our date to check is within a range.
            if (timeToCheckMs >= startTimeMs && timeToCheckMs <= endTimeMs) {
                return true;
            }
        }

        return false;
    }
}
