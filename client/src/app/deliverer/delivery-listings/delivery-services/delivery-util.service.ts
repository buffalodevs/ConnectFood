"use strict";
import { Injectable } from '@angular/core';
import { Delivery } from '../../../../../../shared/deliverer/delivery';
import { TimeRange } from '../../../../../../shared/app-user/time-range';
import { DateFormatter } from '../../../../../../shared/common-util/date-formatter';


@Injectable()
export class DeliveryUtilService {


    public constructor() {}


    /**
     * Calculates the max possible needed diameter of the map based off of the distances to each destination.
     * @param delivery The Delivery object which contains driving distance data (in miles).
     * @return The max possible diameter (in miles).
     */
    public calcMaxMapDiameterFromDelivery(delivery: Delivery): number {
        return (delivery.donorInfo.drivingDistance + delivery.receiverInfo.drivingDistance);
    }


    /**
     * Calculates the total driving distance for a given delivery.
     * @param delivery The Delivery object which contains driving distance data.
     * @return The total driving distance for the delivery (in miles).
     */
    public calcTotalDrivingDistance(delivery: Delivery): number {
        return (Math.round(delivery.donorInfo.drivingDistance + delivery.receiverInfo.drivingDistance * 100) / 100);
    }


    /**
     * Calculates the total driving time for a given delivery.
     * @param delivery The Delivery object which contains driving time data.
     * @return The total driving time for a delivery (in minutes).
     */
    public calcTotalDrivingTime(delivery: Delivery): number {
        return (Math.round(delivery.donorInfo.drivingTime + delivery.receiverInfo.drivingTime * 100) / 100);
    }


    /**
     * Determines if a given delivery can be started now.
     * @param delivery The delivery to check.
     * @return true if it can be started now, false if not.
     */
    public isPossibleDeliveryTimeNow(delivery: Delivery): boolean {

        // The + 600000 is for a 10 minute buffer before the end of the possible delivery Time Range.
        const totalDeliveryTimeMs: number = ( this.calcTotalDrivingTime(delivery) * 60 * 1000 ) + 600000;

        // Get the current date-time and its milliseconds since epoch for easy comparison with other dates.
        const currentDateTime: Date = new Date();
        const currentTimeMs: number = currentDateTime.getTime();

        for (let i: number = 0; i < delivery.possibleDeliveryTimes.length; i++) {

            // First, see if our current day of week matches the time range's day of week.
            if (currentDateTime.getDay() === delivery.possibleDeliveryTimes[i].weekday) {

                // Convert times into a date (based on today), and get milliseconds since epoch for easy comparison with current date-time.
                const startTimeMs: number = DateFormatter.setWallClockTimeForDate(new Date(), delivery.possibleDeliveryTimes[i].startTime).getTime();
                const endTimeMs: number = DateFormatter.setWallClockTimeForDate(new Date(), delivery.possibleDeliveryTimes[i].endTime).getTime();

                if (currentTimeMs >= startTimeMs && currentTimeMs <= (endTimeMs - totalDeliveryTimeMs))
                {  return true;  }
            }
        }

        return false;
    }
}
