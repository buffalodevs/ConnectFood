/* SELECT      Receiver.appUserKey AS receiverKey,
            ReceiverContactInfo.address AS receiverAddress,
            Donor.appUserKey AS donorKey,
            DonorContactInfo.address AS donorAddress,
            ST_DISTANCE(ReceiverContactInfo.gpsCoordinate, DonorContactInfo.gpsCoordinate) AS meters,
            (ST_DISTANCE(ReceiverContactInfo.gpsCoordinate, DonorContactInfo.gpsCoordinate) / 1609.34) AS miles
FROM        AppUser Receiver    
INNER JOIN  ContactInfo ReceiverContactInfo ON Receiver.appUserKey = ReceiverContactInfo.appUserKey
INNER JOIN  AppUser Donor                   ON Donor.appUserKey <> Receiver.appUserKey
INNER JOIN  ContactInfo DonorContactInfo    ON Donor.appUserKey = DonorContactInfo.appUserKey
WHERE       Receiver.appUserKey = 1
  AND       ST_DWITHIN(ReceiverContactInfo.gpsCoordinate, DonorContactInfo.gpsCoordinate, 29731.67); */


--SELECT AppUser.* FROM AppUser;

--delete from AppUserPassword where appUserKey = 1 and createDate <> (select min(createDate) from AppUserPassword where appUserKey = 1);

--SELECT * FROM ClaimedFoodListing;

--SELECT * FROM DeliveryFoodListing;

--SELECT * FROM CancelledDeliveryFoodListing;

--SELECT * FROM AppUserAvailability;


/*SELECT      *
FROM        FoodListing
LEFT JOIN   ClaimedFoodListing ON FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
WHERE       FoodLIsting.foodTitle = 'Test';*/

--DELETE FROM FoodListingFoodTypeMap WHERE foodLIstingKey IN (SELECT foodListingKey FROM FoodListing WHERE foodTitle = 'Test');
--DELETE FROM FoodListing WHERE foodTitle = 'Test';


/*SELECT DeliveryFoodListing.scheduledStartTime FROM FoodListing 
LEFT JOIN ClaimedFoodListing ON ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
LEFT JOIN DeliveryFoodListing ON DeliveryFoodListing.claimedFoodListingKey = ClaimedFoodLIsting.claimedFoodLIstingKey
                              AND NOT EXISTS (
                                  SELECT 1 FROM CancelledDeliveryFoodListing
                                  WHERE CancelledDeliveryFoodLIsting.deliveryFoodLIstingKey = DeliveryFoodListing.deliveryFOodLIstingKey
                              )
WHERE foodTitle = 'Lots of beans';*/

/*SELECT * FROM FoodListing
LEFT JOIN RemovedFoodListing ON FoodListing.foodListingKey = RemovedFoodListing.foodListingKey;

SELECT * FROM ClaimedFoodListing
LEFT JOIN UnclaimedFoodListing ON ClaimedFoodListing.claimedFoodListingKey = UnclaimedFoodListing.claimedFoodListingKey;

SELECT * FROM DeliveryFoodListing
LEFT JOIN CancelledDeliveryFoodListing ON DeliveryFoodListing.deliveryFoodListingKey = CancelledDeliveryFoodListing.deliveryFoodListingKey;

SELECT * FROM AppUserAvailability;*/

--SELECT * FROM scheduleDelivery(5, 1, true, null);
