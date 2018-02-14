/**
 * A basic function for removing a food listing (donation) and any associated data.
 */
SELECT dropFunction('removefoodlisting');
CREATE OR REPLACE FUNCTION removeFoodListing
(
    _foodListingKey         FoodListing.foodListingKey%TYPE,                       -- The key ID of the Food Listing that is being removed.
    _removedByAppUserKey    AppUser.appUserKey%TYPE,                               /* The app user that is causing the removal
                                                                                      NOTE: (should only be associated donor, receiver, or deliverer). */
    _removalReason          RemovedFoodListing.removalReason%TYPE,                 -- The reason why the food listing was removed.
    _foodRejected           RemovedFoodListing.foodRejected%TYPE    DEFAULT FALSE  -- Determines if the removal is due to rejection from Receiver or Deliverer.
)
-- Return user information of (receiver/deliverer) app users who were affected by the removal of the donation.
RETURNS TABLE (
    claimInfoKey            ClaimInfo.claimInfoKey%TYPE,
    unclaimNotificationData JSON
)
AS $$
    DECLARE _claimInfoKey ClaimInfo.claimInfoKey%TYPE;
BEGIN

    -- Make sure the food listing we are to delete exists and was donated by user issuing this command.
    IF NOT EXISTS (
        SELECT      1
        FROM        FoodListing
        LEFT JOIN   ClaimInfo       ON  FoodListing.foodListingKey = ClaimInfo.foodListingKey
                                    AND NOT EXISTS (
                                        SELECT  1
                                        FROM    UnclaimInfo
                                        WHERE   UnclaimInfo.claimInfoKey = ClaimInfo.claimInfoKey
                                    )
        LEFT JOIN   DeliveryInfo    ON  ClaimInfo.claimInfoKey = DeliveryInfo.claimInfoKey
                                    AND NOT EXISTS (
                                        SELECT  1
                                        FROM    CancelledDeliveryInfo
                                        WHERE   CancelledDeliveryInfo.deliveryInfoKey = DeliveryInfo.deliveryInfoKey
                                    )
        WHERE       FoodListing.foodListingKey = _foodListingKey
          AND       (   FoodListing.donorAppUserKey = _removedByAppUserKey
                     OR ClaimInfo.receiverAppUserKey = _removedByAppUserKey
                     OR DeliveryInfo.delivererAppUserKey = _removedByAppUserKey )

    )
    THEN
        RAISE EXCEPTION 'Food listing does not exist, or user not authorized.';
    END IF;


    -- Make sure that the food listing has not already been removed (double removal should never happen although it will not cause problems).
    IF EXISTS (
        SELECT  1
        FROM    RemovedFoodListing
        WHERE   RemovedFoodListing.foodListingKey = _foodListingKey
    )
    THEN
        RAISE EXCEPTION 'Food listing has already been removed.';
    END IF;

    
    -- Finally, mark the food listing as removed by creating entry in RemovedFoodListing table.
    INSERT INTO RemovedFoodListing (foodListingKey, removedByAppUserKey, removalReason, foodRejected)
    VALUES      (_foodListingKey, _removedByAppUserKey, _removalReason, _foodRejected);


    -- Make sure we return any unclaim notification data if there were claimed food listings associated with the removed food listing.
    SELECT      ClaimInfo.claimInfoKey
    INTO        _claimInfoKey
    FROM        FoodListing
    INNER JOIN  ClaimInfo ON FoodListing.foodListingKey = ClaimInfo.foodListingKey
    WHERE       FoodListing.foodListingKey = _foodListingKey;

    RETURN QUERY
    SELECT * FROM getUnclaimNotificationData(_claimInfoKey, _removalReason);

END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM FoodListing;
SELECT removeFoodListing(3, 1);
SELECT * FROM FoodListing;
*/
