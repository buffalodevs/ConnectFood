import { Pipe, PipeTransform } from '@angular/core';
import { DateFormatterService } from '../services/date-formatter.service';


@Pipe({
    name: 'dateFormatter'
})
export class DateFormatterPipe implements PipeTransform {

    public constructor (
        private _dateFormatter: DateFormatterService
    ) {}


    /**
     * Transforms a given date to a mm/dd/yyyy string.
     * @param value The date.
     * @return The string.
     */
    public transform(value: Date): string {
        return this._dateFormatter.dateToMonthDayYearString(value);
    }
}
