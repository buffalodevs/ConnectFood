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

SELECT * FROM DeliveryFoodListing;

SELECT * FROM CancelledDeliveryFoodListing;

SELECT * FROM AppUserAvailability;
