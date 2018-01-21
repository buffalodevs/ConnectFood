/**
 * Schedules a new delivery by adding a new DeliveryFoodListing.
 */
SELECT dropFunction('scheduleDelivery');
CREATE OR REPLACE FUNCTION scheduleDelivery
(
    _claimedFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,    -- This is the key of the Claimed Food Listing that is to be delivered.
    _delivererAppUserKey    DeliveryFoodListing.delivererAppUserKey%TYPE,       -- This is the key of the user who is delivering the Food Listing.
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
    -- DONE
    /*IF NOT EXISTS(SELECT 1
                  FROM DeliveryFoodListing TABLE
                  WHERE _deliveryAppUserKey = deliveryAppUserKey)
    THEN 
        RAISE EXCEPTION 'This appUserKey does not exist in the DeliveryFoodListing table';
    IF NOT EXISTS(SLECT 1
                  FROM DeliveryFoodListing TABLE
                  WHERE _claimedFoodListingKey = claimedFoodListingKey)
    THEN
        RAISE EXCEPTION 'This claimedFoodListingKey does not exist in the DeliveryFoodListing table';

    _scheduledStartTimestamp := CASE (_startImmediately)
                                    WHEN TRUE THEN  CURRENT_TIMESTAMP
                                    ELSE            TO_TIMESTAMP(_scheduledStartTime, 'MM/DD/YYYY hh:mi AM')
                                END;*/

    INSERT INTO DeliveryFoodListing
    (
        claimedFoodListingKey,
        delivererAppUserKey,
        scheduledStartTime
    )
    VALUES
    (
        _claimedFoodListingKey,
        _delivererAppUserKey,
        _scheduledStartTimestamp
    )
    RETURNING   DeliveryFoodListing.deliveryFoodListingKey
    INTO        _deliveryFoodListingKey;

    -- If starting immediately, then update the state of the new delivery to started (and returned update notification will be for started state change, not scheduled)!
    IF (_startImmediately) THEN

        SELECT  deliveryUpdateNotification
        INTO    _deliveryUpdateNotification
        FROM    updateDeliveryState(_deliveryFoodListingKey, _delivererAppUserKey, 'started', _currentTimestamp);

    -- Else, we need to set the delivery update notification for the scheduled state change here!
    ELSE
        _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryFoodListingKey, 'scheduled'::DeliveryState,
                                                                     'unscheduled'::DeliveryState, _scheduledStartTimestamp);
    END IF;

    RETURN QUERY
    SELECT  _deliveryFoodListingKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
