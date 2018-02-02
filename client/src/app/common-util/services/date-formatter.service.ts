import { Injectable } from "@angular/core";
import { DateFormatter } from "../../../../../shared/src/date-time-util/date-formatter";


@Injectable()
export class DateFormatterService extends DateFormatter {

    public constructor() {
        super();
    }
}
