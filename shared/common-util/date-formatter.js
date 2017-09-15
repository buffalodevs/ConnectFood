"use strict";
exports.__esModule = true;
var DateFormatter = /** @class */ (function () {
    // Pure static class!
    function DateFormatter() {
    }
    DateFormatter.dateToMonthDayYearString = function (date) {
        if (date != null) {
            // Check to see if we are in fact passed a Date object (may have been stringified in JSON response)!
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            return (date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear());
        }
        return '';
    };
    return DateFormatter;
}());
exports.DateFormatter = DateFormatter;
