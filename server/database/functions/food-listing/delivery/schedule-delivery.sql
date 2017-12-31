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
    deliveryFoodListingKey      DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    deliveryUpdateNotification  JSON
)
AS $$
    DECLARE _deliveryFoodListingKey     DeliveryFoodListing.deliveryFoodListingKey%TYPE;
    DECLARE _deliveryUpdateNotification JSON;
    DECLARE _scheduledStartTimestamp    TIMESTAMP;
BEGIN

    -- TODO: Check that the delivery app user and claimed food listing exist!

    _scheduledStartTimestamp := CASE (_startImmediately)
                                    WHEN TRUE THEN  CURRENT_TIMESTAMP
                                    ELSE            TO_TIMESTAMP(_scheduledStartTime, 'MM/DD/YYYY hh:mi AM')
                                END;

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
        _scheduledStartTimestamp
    )
    RETURNING   DeliveryFoodListing.deliveryFoodListingKey
    INTO        _deliveryFoodListingKey;

    -- If starting immediately, then update the state of the new delivery to started (and returned update notification will be for started state change, not scheduled)!
    IF (_startImmediately) THEN

        SELECT  deliveryUpdateNotification
        INTO    _deliveryUpdateNotification
        FROM    updateDeliveryState(_deliveryFoodListingKey, _deliveryAppUserKey, 'started', _currentTimestamp);

    -- Else, we need to set the delivery update notification for the scheduled state change here!
    ELSE
        _deliveryUpdateNotification := generateDeliveryUpdateNotification(_deliveryFoodListingKey, 'scheduled'::DeliveryState,
                                                                          'unscheduled'::DeliveryState, _scheduledStartTimestamp);
    END IF;

    RETURN QUERY
    SELECT  _deliveryFoodListingKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
