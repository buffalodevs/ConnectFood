/**
 * Schedules a new delivery by adding a new DeliveryFoodListing.
 */
SELECT dropFunction('scheduleDelivery');
CREATE OR REPLACE FUNCTION scheduleDelivery
(
    _claimedFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,    -- This is the key of the Claimed Food Listing that is to be delivered.
    _deliveryAppUserKey     DeliveryFoodListing.deliveryAppUserKey%TYPE,        -- This is the key of the user who is delivering the Food Listing.
    _startImmediately       BOOLEAN,                                            -- TRUE if the deliverer will start delivery immediately, FALSE if scheduled for future.
    _scheduledStartTime     TEXT DEFAULT NULL                                   -- The time that the deliverer has scheduled to start the delivery.
                                                                                -- Leave default only if _startImmediately is set TRUE. Otherwise, give explicite value!
)
RETURNS TABLE -- Returns the new Delivery that has been scheduled/started.
(
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    delivery                JSON
)
AS $$
    DECLARE _deliveryFoodListingKey DeliveryFoodListing.deliveryFoodListingKey%TYPE;
    DECLARE _currentTimestamp       TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
BEGIN

    -- TODO: Check that the delivery app user and claimed food listing exist!

    INSERT INTO DeliveryFoodListing
    (
        claimedFoodListingKey,
        deliveryAppUserKey,
        scheduledStartTime
    )
    VALUES
    (
        _claimedFoodListingKey,
        _deliveryAppUserKey,
        CASE (_startImmediately)
            WHEN TRUE THEN  _currentTimestamp
            ELSE            TO_TIMESTAMP(_scheduledStartTime, 'MM/DD/YYYY hh:mi AM')
        END
    )
    RETURNING   DeliveryFoodListing.deliveryFoodListingKey
    INTO        _deliveryFoodListingKey;

    -- If starting immediately, then update the state of the new delivery to started!
    IF (_startImmediately) THEN
        PERFORM updateDeliveryState(_deliveryFoodListingKey, +deliveryAppUserKey, 'started', _currentTimestamp);
    END IF;

    RETURN QUERY
    SELECT * FROM getDeliveries(_deliveryAppUserKey, 0, 1, _deliveryFoodListingKey);

END;
$$ LANGUAGE plpgsql;
