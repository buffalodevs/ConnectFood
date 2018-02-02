/**
 * Updates the Delivery State of a Delivery Food Listing.
 */
SELECT dropFunction('updateDeliveryState');
CREATE OR REPLACE FUNCTION updateDeliveryState
(
     _deliveryFoodListingKey    DeliveryFoodListing.deliveryFoodListingKey%TYPE,    -- This is the key of the Delivery Food Listing element that we are updating the status of.
     _delivererAppUserKey       DeliveryFoodListing.delivererAppUserKey%TYPE,       -- This is the key of the user who is delivering the Food Listing.
     _deliveryState             DeliveryState,
     _stateUpdateTimestamp      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
)
-- Return data so that update notifications may be sent to concerned users (Donors and Receivers).
RETURNS TABLE
(
    deliveryFoodListingKey      DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    deliveryUpdateNotification  JSON
)
AS $$
    DECLARE _deliveryUpdateNotification JSON;
BEGIN

    -- TODO: Ensure that delivery app user is associated with this delivery food listing (has rights to update)!
    -- TODO: Ensure that the delivery state is correct. There is one condition of a lack of correctness:
    --       The delivery state would be at least 2 steps (states) behind or ahead of the current one that it is on.
    --       This allows the deliverer to undo at most one state transition at a time, and progress it one state at a time!

    _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryFoodListingKey, _deliveryState);

    UPDATE  DeliveryFoodListing
    SET     startTime   =   CASE (_deliveryState)
                                WHEN 'started'      THEN    _stateUpdateTimestamp
                                ELSE                        startTime
                            END,
            pickUpTime  =   CASE (_deliveryState)
                                WHEN 'pickedUp'     THEN    _stateUpdateTimestamp
                                WHEN 'started'      THEN    NULL -- Going back a step.
                                ELSE                        pickUpTime
                            END,
            dropOffTime =   CASE (_deliveryState)
                                WHEN 'droppedOff'   THEN    _stateUpdateTimestamp
                                WHEN 'pickedUp'     THEN    NULL -- Going back a step.
                                ELSE                        dropOffTime
                            END
    WHERE   DeliveryFoodListing.deliveryFoodListingKey = _deliveryFoodListingKey;    

    RETURN QUERY
    SELECT  _deliveryFoodListingKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM updateDeliveryState(7, 1, 'started');
