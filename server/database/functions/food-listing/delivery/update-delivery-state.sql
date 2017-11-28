/**
 * Updates the Delivery State of a Delivery Food Listing.
 */
SELECT dropFunction('updateDeliveryState');
CREATE OR REPLACE FUNCTION updateDeliveryState
(
     _deliveryFoodListingKey    DeliveryFoodListing.deliveryFoodListingKey%TYPE,    -- This is the key of the Delivery Food Listing element that we are updating the status of.
     _deliveryAppUserKey        DeliveryFoodListing.deliveryAppUserKey%TYPE,        -- This is the key of the user who is delivering the Food Listing.
     _deliveryState             DeliveryState
)
RETURNS DeliveryFoodListing.deliveryFoodListingKey%TYPE -- The deliveryFoodListing primary key.
AS $$
    DECLARE _deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE;
BEGIN

    -- TODO: Check that the delivery app user and delivery food listing exist!
    -- TODO: Ensure that delivery app user is associated with this delivery food listing (has rights to update)!
    -- TODO: Ensure that the delivery state is correct. There is one condition of a lack of correctness:
    --       The delivery state would be at least 2 steps (states) behind or ahead of the current one that it is on.
    --       This allows the deliverer to undo at most one state transition at a time, and progress it one state at a time!


    UPDATE  DeliveryFoodListing
    SET     startTime   =   CASE (_deliveryState)
                                WHEN 'On route to donor' THEN       CURRENT_TIMESTAMP
                                ELSE                                startTime
                            END,
            pickupTime  =   CASE (_deliveryState)
                                WHEN 'On route to receiver' THEN    CURRENT_TIMESTAMP
                                WHEN 'On route to donor'    THEN    NULL -- Going back a step.
                                ELSE                                pickuptTime
                            END,
            dropOffTime =   CASE (_deliveryState)
                                WHEN 'Delivery completed'   THEN    CURRENT_TIMESTAMP
                                WHEN 'On route to receiver' THEN    NULL -- Going back a step.
                                ELSE                                dropOffTime
                            END
    WHERE   deliveryFoodListingKey = _deliveryFoodListingKey;    

    RETURN _deliveryFoodListingKey;

END;
$$ LANGUAGE plpgsql;
