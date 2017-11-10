"use strict";
import { Injectable } from '@angular/core';
import { DeliveryFoodListing } from '../../../../../../shared/food-listings/delivery-food-listing';


@Injectable()
export class DeliveryFoodListingUtilService {


    public constructor() {}


    /**
     * Calculates the max possible needed diameter of the map based off of the distances to each destination.
     * @param deliveryFoodListing The delivery food listing which contains driving distance data (in miles).
     * @return The max possible diameter (in miles).
     */
    public calcMaxMapDiameterFromDelivery(deliveryFoodListing: DeliveryFoodListing): number {
        return (deliveryFoodListing.donorInfo.drivingDistance + deliveryFoodListing.receiverInfo.drivingDistance);
    }


    /**
     * Calculates the total driving distance for a given delivery.
     * @param deliveryFoodListing The Delivery Food Listing which contains driving distance data.
     * @return The total driving distance for the delivery (in miles).
     */
    public calcTotalDrivingDistance(deliveryFoodListing: DeliveryFoodListing): number {
        return (Math.round(deliveryFoodListing.donorInfo.drivingDistance + deliveryFoodListing.receiverInfo.drivingDistance * 100) / 100);
    }


    /**
     * Calculates the total driving time for a given delivery.
     * @param deliveryFoodListing The Delivery Food Listing which contains driving time data.
     * @return The total driving time for a delivery (in minutes).
     */
    public calcTotalDrivingTime(deliveryFoodListing: DeliveryFoodListing): number {
        return (Math.round(deliveryFoodListing.donorInfo.drivingTime + deliveryFoodListing.receiverInfo.drivingTime * 100) / 100);
    }
}
