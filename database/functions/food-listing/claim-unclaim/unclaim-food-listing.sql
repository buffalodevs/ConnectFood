SELECT dropFunction('unclaimFoodListing');
CREATE OR REPLACE FUNCTION unclaimFoodListing
(
    _foodListingKey         ClaimInfo.foodListingKey%TYPE,         -- This is the key of the Food Listing that is being unclaimed.
    _receiverAppUserKey     ClaimInfo.receiverAppUserKey%TYPE,     -- This is the key of the user who is unclaiming the Food Listing (Must be Receiver).
    _unclaimReason          UnclaimInfo.unclaimReason%TYPE         -- The reason why the Food Listing is being unclaimed.
)
-- Return user information of (receiver/deliverer) app users who were affected by the unclaim.
RETURNS TABLE (
    claimInfoKey   ClaimInfo.claimInfoKey%TYPE,
    unclaimNotificationData JSON
)
AS $$
    DECLARE _claimInfoKey  ClaimInfo.claimInfoKey%TYPE;
BEGIN

    -- Grab key of Claimed Food Listing that is to be unclaimed. Also, implicitly check that the user calling this function is the receiver.
    SELECT  ClaimInfo.claimInfoKey
    INTO    _claimInfoKey
    FROM    ClaimInfo
    WHERE   ClaimInfo.foodListingKey = _foodListingKey
      AND   ClaimInfo.receiverAppUserKey = _receiverAppUserKey
            -- Ensure we don't pull back old unclaimed food listings instead of the most recent claimed food listing!
      AND   NOT EXISTS (
                SELECT  1
                FROM    UnclaimInfo
                WHERE   UnclaimInfo.claimInfoKey = ClaimInfo.claimInfoKey
            );

    -- Ensure claimed food listing exists and current user is the receiver (claimer) of the food listing.
    IF (_claimInfoKey IS NULL)
    THEN
        RAISE EXCEPTION 'Either claimed food listing does not exist, or user unauthorized to unclaim it.';
    END IF;


    -- Mark the claimed food listing as unclaimed.
    INSERT INTO UnclaimInfo (claimInfoKey, unclaimReason)
    VALUES      (_claimInfoKey, _unclaimReason);


    -- Retrun all information pertaining to affected App Users (Receivers who lost claims and Deliverers who lost scheduled deliveries).
    RETURN QUERY ( SELECT * FROM getUnclaimNotificationData(_claimInfoKey, _unclaimReason) );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM unclaimFoodListing(52, 1, 100);
