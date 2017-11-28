/**
 * Adds a new delivery food listing
 */
SELECT dropFunction('startFoodListingDelivery');
CREATE OR REPLACE FUNCTION addDeliveryFoodListing
(
    _claimedFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,    -- This is the key of the Claimed Food Listing that is to be delivered.
    _deliveryAppUserKey     DeliveryFoodListing.deliveryAppUserKey%TYPE,        -- This is the key of the user who is delivering the Food Listing.
    _startImmediately       BOOLEAN,                                            -- TRUE if the deliverer will start delivery immediately, FALSE if scheduled for future.
    _scheduledStartTime     TEXT DEFAULT CURRENT_TIMESTAMP                      -- The time that the deliverer has scheduled to start the delivery.
                                                                                -- Leave default only if _startImmediately is set TRUE. Otherwise, give explicite value!
)
RETURNS DeliveryFoodListing.deliveryFoodListingKey%TYPE -- The deliveryFoodListing primary key.
AS $$
    DECLARE _deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE;
BEGIN

    -- TODO: Check that the delivery app user and claimed food listing exist!

    INSERT INTO DeliveryFoodListing
    (
        claimedFoodListingKey,
        deliveryAppUserKey,
        scheduledStartTime,
        startTime
    )
    VALUES
    (
        _claimedFoodListingKey,
        _deliveryAppUserKey,
        _scheduledStartTime,
        CASE (_startImmediately)
            WHEN TRUE THEN  _scheduledStartTime
            ELSE            NULL
        END
    )
    RETURNING   deliveryFoodListingKey
    INTO        _deliveryFoodListingKey;

    RETURN _deliveryFoodListingKey;

END;
$$ LANGUAGE plpgsql;
