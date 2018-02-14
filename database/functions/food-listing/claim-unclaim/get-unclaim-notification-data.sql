SELECT dropFunction('getUnclaimNotificationData');
CREATE OR REPLACE FUNCTION getUnclaimNotificationData
(
    _claimInfoKey   ClaimInfo.claimInfoKey%TYPE,
    _unclaimReason  UnclaimInfo.unclaimReason%TYPE
)
RETURNS TABLE
(
    claimInfoKey   ClaimInfo.claimInfoKey%TYPE,
    unclaimNotificationData JSON
)
AS $$

    SELECT      ClaimInfo.claimInfoKey,
                -- @ts-sql class="UnclaimNotification" file="/server/src/receiver-donor/common-receiver-donor/unclaim-notification.ts"
                JSON_BUILD_OBJECT (
                    'foodTitle',            FoodListing.foodTitle,
                    'unclaimReason',        _unclaimReason,
                    'donorSessionData',     ( SELECT sessionData FROM getAppUserSessionData(FoodListing.donorAppUserKey) ),
                    'receiverSessionData',  ( SELECT sessionData FROM getAppUserSessionData(ClaimInfo.receiverAppUserKey) ),
                    'delivererSessionData', CASE
                                                WHEN DeliveryInfo.delivererAppUserKey IS NOT NULL
                                                     THEN ( SELECT sessionData FROM getAppUserSessionData(DeliveryInfo.delivererAppUserKey) )
                                                ELSE NULL
                                            END
                ) AS unclaimNotificationData
    -- Results from here should be very small in number, and therefore, this shouldn't be inefficient without indexes.
    FROM        ClaimInfo
    INNER JOIN  FoodListing         ON ClaimInfo.foodListingKey = FoodListing.foodListingKey
    LEFT JOIN   DeliveryInfo ON ClaimInfo.claimInfoKey = DeliveryInfo.claimInfoKey
    WHERE       ClaimInfo.claimInfoKey = _claimInfoKey;

$$ LANGUAGE sql;


-- SELECT * FROM getUnclaimNotificationData(1, 'Test Reason');
