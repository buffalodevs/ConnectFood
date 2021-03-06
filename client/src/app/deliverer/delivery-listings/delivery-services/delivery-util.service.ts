"use strict";
import { Injectable } from '@angular/core';
import { DateFormatterService } from '../../../common-util/services/date-formatter.service';
import { DeliveryState, DeliveryUtil } from '../../../../../../shared/src/deliverer/delivery-util';
import { FoodListing } from '../../../../../../shared/src/common-user/food-listing';

export { DeliveryState };


@Injectable()
export class DeliveryUtilService {


    public constructor() {}


    /**
     * Calculates the max possible needed diameter of the map based off of the distances to each destination.
     * @param delivery The Delivery object which contains driving distance data (in miles).
     * @return The max possible diameter (in miles).
     */
    public calcMaxMapDiameterFromDelivery(delivery: FoodListing): number {
        return (delivery.donorInfo.contactInfo.drivingDistance + delivery.claimInfo.receiverInfo.contactInfo.drivingDistance);
    }


    /**
     * Calculates the total driving distance for a given delivery.
     * @param delivery The Delivery object which contains driving distance data.
     * @return The total driving distance for the delivery (in miles).
     */
    public calcTotalDrivingDistance(delivery: FoodListing): number {
        return (Math.round((delivery.donorInfo.contactInfo.drivingDistance + delivery.claimInfo.receiverInfo.contactInfo.drivingDistance) * 100) / 100);
    }


    /**
     * Calculates the total driving time for a given delivery.
     * @param delivery The Delivery object which contains driving time data.
     * @return The total driving time for a delivery (in minutes).
     */
    public calcTotalDrivingTime(delivery: FoodListing): number {
        return (Math.round((delivery.donorInfo.contactInfo.drivingTime + delivery.claimInfo.receiverInfo.contactInfo.drivingTime) * 100) / 100);
    }


    /**
     * Determines if a given delivery can be started now.
     * @param delivery The delivery to check.
     * @return true if it can be started now, false if not.
     */
    public isPossibleDeliveryTimeNow(delivery: FoodListing): boolean {

        // The + 600000 is for a 10 minute buffer before the end of the possible delivery Time Range.
        const totalDeliveryTimeMs: number = ( this.calcTotalDrivingTime(delivery) * 60 * 1000 ) + 600000;

        // Get the current date-time and its milliseconds since epoch for easy comparison with other dates.
        const currentDateTime: Date = new Date();
        const currentTimeMs: number = currentDateTime.valueOf();

        // See if the current time falls in between any of the possible delivery time ranges.
        for (let i: number = 0; i < delivery.claimInfo.possibleDeliveryTimes.length; i++) {

            const startTimeMs: number = delivery.claimInfo.possibleDeliveryTimes[i].startTime.valueOf();
            const endTimeMs: number = delivery.claimInfo.possibleDeliveryTimes[i].endTime.valueOf();

            if (currentTimeMs >= startTimeMs && currentTimeMs <= (endTimeMs - totalDeliveryTimeMs))
            {  return true;  }
        }

        return false;
    }


    /**
     * Gets the values of the DeliveryState enum members.
     * @return An array of the Delivery State string values.
     */
    public getDeliveryStateVals(): string[] {
        return DeliveryUtil.getDeliveryStateVals();
    }


    /**
     * Compares two delivery states. This is much like the C language compare method for string comparison. See it for more details.
     * @param lhs The left hand side of the comparison.
     * @param rhs The right hand side of the comparison.
     * @return If lhs < rhs, then any negative number. If lhs > rhs, then any positive number. If lhs == rhs, then 0.
     */
    public compareDeliveryStates(lhs: DeliveryState, rhs: DeliveryState): number {
        return DeliveryUtil.compareDeliveryStates(lhs, rhs);
    }


    /**
     * Converts a given delivery state into an ordered index related to the logical ordering of states as they occur throughout the delivery process.
     * @param deliveryState The delivery state to generate an index for.
     * @return The index of the delivery state.
     */
    public getDeliveryStateIndex(deliveryState: DeliveryState): number {
        return DeliveryUtil.getDeliveryStateIndex(deliveryState);
    }


    /**
     * Gets a human readable version of a given Delivery State value.
     * @param deliveryState The Delivery State.
     * @return A human readable version of the given Delivery State.
     */
    public getReadableDeliveryState(deliveryState: DeliveryState): string {
        return DeliveryUtil.getReadableDeliveryState(deliveryState);
    }
}
