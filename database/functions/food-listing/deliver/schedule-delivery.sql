/**
 * Schedules a new delivery by adding a new DeliveryInfo.
 */
SELECT dropFunction('scheduleDelivery');
CREATE OR REPLACE FUNCTION scheduleDelivery
(
    _claimInfoKey           ClaimInfo.claimInfoKey%TYPE,            -- This is the key of the Claimed Food Listing that is to be delivered.
    _delivererAppUserKey    DeliveryInfo.delivererAppUserKey%TYPE,  -- This is the key of the user who is delivering the Food Listing.
    _startImmediately       BOOLEAN,                                -- TRUE if the deliverer will start delivery immediately, FALSE if scheduled for future.
    _scheduledStartTime     TIMESTAMP DEFAULT NULL                  -- The time that the deliverer has scheduled to start the delivery.
                                                                    -- Leave default only if _startImmediately is set TRUE. Otherwise, give explicite value!
)
RETURNS TABLE -- Returns the new Delivery that has been scheduled/started.
(
    deliveryInfoKey             DeliveryInfo.deliveryInfoKey%TYPE,
    deliveryUpdateNotification  JSON
)
AS $$
    DECLARE _deliveryInfoKey            DeliveryInfo.deliveryInfoKey%TYPE;
    DECLARE _deliveryUpdateNotification JSON;
BEGIN

    -- TODO: Check that the delivery app user and claimed food listing exist!
    -- DONE
    /*IF NOT EXISTS(SELECT 1
                  FROM DeliveryInfo TABLE
                  WHERE _deliveryAppUserKey = deliveryAppUserKey)
    THEN 
        RAISE EXCEPTION 'This appUserKey does not exist in the DeliveryInfo table';
    IF NOT EXISTS(SLECT 1
                  FROM DeliveryInfo TABLE
                  WHERE _claimInfoKey = claimInfoKey)
    THEN
        RAISE EXCEPTION 'This claimInfoKey does not exist in the DeliveryInfo table';*/

    -- If we are starting immediately, then set scheduled start time to now.
    IF (_startImmediately = TRUE)
    THEN
        SET TIME ZONE 'UTC';
        _scheduledStartTime = CURRENT_TIMESTAMP;
    END IF;

    INSERT INTO DeliveryInfo
    (
        claimInfoKey,
        delivererAppUserKey,
        scheduledStartTime
    )
    VALUES
    (
        _claimInfoKey,
        _delivererAppUserKey,
        _scheduledStartTime
    )
    RETURNING   DeliveryInfo.deliveryInfoKey
    INTO        _deliveryInfoKey;

    -- If starting immediately, then update the state of the new delivery to started (and returned update notification will be for started state change, not scheduled)!
    IF (_startImmediately) THEN

        SELECT  updateDeliveryState.deliveryUpdateNotification
        INTO    _deliveryUpdateNotification
        FROM    updateDeliveryState(_deliveryInfoKey, _delivererAppUserKey, 'Started'::DeliveryState, _scheduledStartTime);

    -- Else, we need to set the delivery update notification for the scheduled state change here!
    ELSE
        _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryInfoKey, 'Scheduled'::DeliveryState,
                                                                     'Unscheduled'::DeliveryState, _scheduledStartTime);
    END IF;

    RETURN QUERY
    SELECT  _deliveryInfoKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
