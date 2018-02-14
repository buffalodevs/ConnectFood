/**
 * Updates the Delivery State of a Delivery Food Listing.
 */
SELECT dropFunction('updateDeliveryState');
CREATE OR REPLACE FUNCTION updateDeliveryState
(
     _deliveryInfoKey       DeliveryInfo.deliveryInfoKey%TYPE,    -- This is the key of the Delivery Food Listing element that we are updating the status of.
     _delivererAppUserKey   DeliveryInfo.delivererAppUserKey%TYPE, -- This is the key of the user who is delivering the Food Listing.
     _deliveryState         DeliveryState,
     _stateUpdateTimestamp  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
-- Return data so that update notifications may be sent to concerned users (Donors and Receivers).
RETURNS TABLE
(
    deliveryInfoKey             DeliveryInfo.deliveryInfoKey%TYPE,
    deliveryUpdateNotification  JSON
)
AS $$
    DECLARE _deliveryUpdateNotification JSON;
BEGIN

    -- TODO: Ensure that delivery app user is associated with this delivery food listing (has rights to update)!
    -- TODO: Ensure that the delivery state is correct. There is one condition of a lack of correctness:
    --       The delivery state would be at least 2 steps (states) behind or ahead of the current one that it is on.
    --       This allows the deliverer to undo at most one state transition at a time, and progress it one state at a time!

    _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryInfoKey, _deliveryState);

    UPDATE  DeliveryInfo
    SET     startTime   =   CASE (_deliveryState)
                                WHEN 'Started'::DeliveryState       THEN    _stateUpdateTimestamp
                                ELSE                                        startTime
                            END,
            pickUpTime  =   CASE (_deliveryState)
                                WHEN 'Picked Up'::DeliveryState     THEN    _stateUpdateTimestamp
                                WHEN 'Started'::DeliveryState       THEN    NULL -- Going back a step.
                                ELSE                                        pickUpTime
                            END,
            dropOffTime =   CASE (_deliveryState)
                                WHEN 'Dropped Off'::DeliveryState   THEN    _stateUpdateTimestamp
                                WHEN 'Picked Up'::DeliveryState     THEN    NULL -- Going back a step.
                                ELSE                                        dropOffTime
                            END
    WHERE   DeliveryInfo.deliveryInfo = _deliveryInfoKey;    

    RETURN QUERY
    SELECT  _deliveryInfoKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM updateDeliveryState(7, 1, 'started');
