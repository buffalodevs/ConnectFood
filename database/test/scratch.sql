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

--SELECT * FROM ClaimInfo;

--SELECT * FROM DeliveryInfo;

--SELECT * FROM CancelledDeliveryInfo;

--SELECT * FROM AppUserAvailability;


/*SELECT      *
FROM        FoodListing
LEFT JOIN   ClaimInfo ON FoodListing.foodListingKey = ClaimInfo.foodListingKey
WHERE       FoodLIsting.foodTitle = 'Test';*/

--DELETE FROM FoodListingFoodTypeMap WHERE foodLIstingKey IN (SELECT foodListingKey FROM FoodListing WHERE foodTitle = 'Test');
--DELETE FROM FoodListing WHERE foodTitle = 'Test';


/*SELECT DeliveryInfo.scheduledStartTime FROM FoodListing 
LEFT JOIN ClaimInfo ON ClaimInfo.foodListingKey = FoodListing.foodListingKey
LEFT JOIN DeliveryInfo ON DeliveryInfo.ClaimInfoKey = ClaimInfo.ClaimInfoKey
                              AND NOT EXISTS (
                                  SELECT 1 FROM CancelledDeliveryInfo
                                  WHERE CancelledDeliveryInfo.deliveryInfoKey = DeliveryInfo.deliveryInfoKey
                              )
WHERE foodTitle = 'Lots of beans';*/

/*SELECT * FROM FoodListing
LEFT JOIN RemovedFoodListing ON FoodListing.foodListingKey = RemovedFoodListing.foodListingKey;

SELECT * FROM ClaimInfo
LEFT JOIN UnClaimInfo ON ClaimInfo.ClaimInfoKey = UnClaimInfo.ClaimInfoKey;

SELECT * FROM DeliveryInfo
LEFT JOIN CancelledDeliveryInfo ON DeliveryInfo.deliveryInfoKey = CancelledDeliveryInfo.deliveryInfoKey;

SELECT * FROM AppUserAvailability;*/

--SELECT * FROM scheduleDelivery(5, 1, true, null);

/*
DELETE FROM AppUserAvailability;

INSERT INTO AppUserAvailability (appUserKey, startWeekday, startTime, endWeekday, endTime)
VALUES      (1, 0, TO_TIMESTAMP('9:00', 'HH24:MI')::TIME, 0, TO_TIMESTAMP('13:00', 'HH24:MI')::TIME),
            (2, 0, TO_TIMESTAMP('9:00', 'HH24:MI')::TIME, 0, TO_TIMESTAMP('13:00', 'HH24:MI')::TIME),
            (4, 0, TO_TIMESTAMP('9:00', 'HH24:MI')::TIME, 0, TO_TIMESTAMP('13:00', 'HH24:MI')::TIME)
*/

/*
INSERT INTO AppUserAvailability (appUserKey, startTime, endTime)
VALUES      (1, TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI'), TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI')),
            (2, TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI'), TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI')),
            (4, TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI'), TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI'))
*/

/*
DELETE FROM AppUserPassword WHERE appUserKey NOT IN (1, 2, 4);
DELETE FROM UnverifiedAppUser WHERE appUserKey NOT IN (1, 2, 4);
DELETE FROM ContactInfo WHERE appUserKey NOT IN (1, 2, 4);
DELETE FROM AppUser WHERE appUserKey NOT IN (1, 2, 4);
*/

SELECT * FROM DeliveryInfo;
