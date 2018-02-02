SELECT dropFunction('unclaimFoodListing');
CREATE OR REPLACE FUNCTION unclaimFoodListing
(
    _foodListingKey         ClaimedFoodListing.foodListingKey%TYPE,         -- This is the key of the Food Listing that is being unclaimed.
    _receiverAppUserKey     ClaimedFoodListing.receiverAppUserKey%TYPE,     -- This is the key of the user who is unclaiming the Food Listing (Must be Receiver).
    _unclaimReason          UnclaimedFoodListing.unclaimReason%TYPE         -- The reason why the Food Listing is being unclaimed.
)
-- Return user information of (receiver/deliverer) app users who were affected by the unclaim.
RETURNS TABLE (
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    unclaimNotificationData JSON
)
AS $$
    DECLARE _claimedFoodListingKey  ClaimedFoodListing.claimedFoodListingKey%TYPE;
BEGIN

    -- Grab key of Claimed Food Listing that is to be unclaimed. Also, implicitly check that the user calling this function is the receiver.
    SELECT  ClaimedFoodListing.claimedFoodListingKey
    INTO    _claimedFoodListingKey
    FROM    ClaimedFoodListing
    WHERE   ClaimedFoodListing.foodListingKey = _foodListingKey
      AND   ClaimedFoodListing.receiverAppUserKey = _receiverAppUserKey
            -- Ensure we don't pull back old unclaimed food listings instead of the most recent claimed food listing!
      AND   NOT EXISTS (
                SELECT  1
                FROM    UnclaimedFoodListing
                WHERE   UnclaimedFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
            );

    -- Ensure claimed food listing exists and current user is the receiver (claimer) of the food listing.
    IF (_claimedFoodListingKey IS NULL)
    THEN
        RAISE EXCEPTION 'Either claimed food listing does not exist, or user unauthorized to unclaim it.';
    END IF;


    -- Mark the claimed food listing as unclaimed.
    INSERT INTO UnclaimedFoodListing (claimedFoodListingKey, unclaimReason)
    VALUES      (_claimedFoodListingKey, _unclaimReason);


    -- Retrun all information pertaining to affected App Users (Receivers who lost claims and Deliverers who lost scheduled deliveries).
    RETURN QUERY ( SELECT * FROM getUnclaimNotificationData(_claimedFoodListingKey, _unclaimReason) );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM unclaimFoodListing(52, 1, 100);
