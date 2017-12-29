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


SELECT      FoodListing.foodListingKey,
                    ARRAY_AGG (
                                            JSON_BUILD_OBJECT (
                                                'receiverInfo',       CASE
                                                                        WHEN (ReceiverAppUser.appUserKey IS NOT NULL) THEN (
                                                                            SELECT  sessionData->'appUserInfo'
                                                                            FROM    getAppUserSessionData(ReceiverAppUser.appUserKey)
                                                                        )
                                                                        ELSE NULL
                                                                        END,
                                                'delivererInfo',      CASE
                                                                        WHEN (DeliveryAppUser.appUserKey IS NOT NULL) THEN (
                                                                            SELECT  sessionData->'appUserInfo'
                                                                            FROM    getAppUserSessionData(DeliveryAppUser.appUserKey)
                                                                        )
                                                                        ELSE NULL
                                                                        END,
                                                'deliveryStateInfo',  NULL
                                            )
                                        )
        FROM        FoodListing
        INNER JOIN  FoodListingFoodTypeMap ON FoodListing.foodListingKey = FoodListingFoodTypeMap.foodListingKey
    
            LEFT JOIN   ClaimedFoodListing      ON  FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
            LEFT JOIN   AppUser ReceiverAppUser ON  ClaimedFoodListing.claimedByAppUserKey = ReceiverAppUser.appUserKey
            LEFT JOIN   DeliveryFoodListing     ON  ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
                                                -- Make sure we do not include cancelled deliveries!
                                                AND NOT EXISTS (
                                                        SELECT  1
                                                        FROM    CancelledDeliveryFoodListing
                                                        WHERE   CancelledDeliveryFoodListing.deliveryFoodListingKey
                                                                = DeliveryFoodListing.deliveryFoodListingKey
                                                    )
            LEFT JOIN   AppUser DeliveryAppUser ON  DeliveryFoodListing.deliveryAppUserKey = DeliveryAppUser.appUserKey
     
        GROUP BY FoodListing.foodListingKey, ClaimedFoodListing.claimedFoodListingKey
        ORDER BY FoodListing.postDate DESC
