SELECT dropFunction('getUnclaimNotificationData');
CREATE OR REPLACE FUNCTION getUnclaimNotificationData
(
    _claimedFoodListingKey  ClaimedFoodListing.claimedFoodListingKey%TYPE,
    _unclaimReason          UnclaimedFoodListing.unclaimReason%TYPE
)
RETURNS TABLE
(
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    unclaimNotificationData JSON
)
AS $$

    SELECT      ClaimedFoodListing.claimedFoodListingKey,
                -- @ts-sql class="UnclaimNotification" file="/server/src/receiver-donor/common-receiver-donor/unclaim-notification.ts"
                JSON_BUILD_OBJECT (
                    'foodTitle',            FoodListing.foodTitle,
                    'unclaimReason',        _unclaimReason,
                    'donorSessionData',     ( SELECT sessionData FROM getAppUserSessionData(FoodListing.donorAppUserKey) ),
                    'receiverSessionData',  ( SELECT sessionData FROM getAppUserSessionData(ClaimedFoodListing.receiverAppUserKey) ),
                    'delivererSessionData', CASE
                                                WHEN DeliveryFoodListing.delivererAppUserKey IS NOT NULL
                                                     THEN ( SELECT sessionData FROM getAppUserSessionData(DeliveryFoodListing.delivererAppUserKey) )
                                                ELSE NULL
                                            END
                ) AS unclaimNotificationData
    -- Results from here should be very small in number, and therefore, this shouldn't be inefficient without indexes.
    FROM        ClaimedFoodListing
    INNER JOIN  FoodListing         ON ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
    LEFT JOIN   DeliveryFoodListing ON ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
    WHERE       ClaimedFoodListing.claimedFoodListingKey = _claimedFoodListingKey;

$$ LANGUAGE sql;


-- SELECT * FROM getUnclaimNotificationData(1, 'Test Reason');
