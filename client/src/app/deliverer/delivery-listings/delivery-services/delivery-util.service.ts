"use strict";
import { Injectable } from '@angular/core';
import { Delivery } from '../../../../../../shared/deliverer/delivery';


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
}
