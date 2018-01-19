/**
 * Cancels the delivery of a Food Listing.
 */
SELECT dropFunction('cancelDelivery');
CREATE OR REPLACE FUNCTION cancelDelivery
(
     _deliveryFoodListingKey    DeliveryFoodListing.deliveryFoodListingKey%TYPE,            -- This is the key of the Delivery Food Listing that is to be cancelled.
     _cancelledByAppUserKey     CancelledDeliveryFoodListing.cancelledByAppUserKey%TYPE,    -- This is the key of the user who is cancelling the delivery of the Food Listing.
     _cancelReason              CancelledDeliveryFoodListing.cancelReason%TYPE,             -- The reason why the delivery was cancelled.
     _foodRejected              CancelledDeliveryFoodListing.foodRejected%TYPE              -- TRUE if the food was rejected due to inadequate quality, FALSE if not rejected.
)
RETURNS TABLE -- Returns the Delivery that has been cancelled.
(
    cancelledDeliveryFoodListingKey CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey%TYPE,
    deliveryUpdateNotification      JSON
)
AS $$
    DECLARE _cancelledDeliveryFoodListingKey    CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey%TYPE;
    DECLARE _deliveryUpdateNotification         JSON;
BEGIN

    -- TODO: Check that the cancelling app user and claimed food listing exist!
    -- DONE
    IF NOT EXISTS(SELECT 1
                  FROM AppUser TABLE
                  WHERE _cancelledByAppUserKey = appUserKey)
    THEN 
        RAISE EXCEPTION 'This appUserKey does not exist';
    IF NOT EXISTS(SLECT 1
                  FROM DeliveryFoodListing TABLE
                  WHERE _deliveryFoodListingKey = deliveryFoodListingKey)
    THEN
        RAISE EXCEPTION 'This deliveryfoodListingKey does not exist in the DeliveryFoodListing table';
    -- TODO: Ensure that the cancelling app user is authorized (must be the donor, receiver, or deliverer only)!
    --       Additionally, the Donor and Receiver cannot cancel the delivery after it has been started (startTime IS NOT NULL)!

    _deliveryUpdateNotification := generateDeliveryUpdateNotification(_deliveryFoodListingKey, 'unscheduled'::DeliveryState, NULL, NULL,
                                                                      TRUE, _cancelReason, _foodRejected);

    INSERT INTO CancelledDeliveryFoodListing
    (
        deliveryFoodListingKey,
        cancelledByAppUserKey,
        cancelReason,
        foodRejected
    )
    VALUES
    (
        _deliveryFoodListingKey,
        _cancelledByAppUserKey,
        _cancelReason,
        _foodRejected
    )
    RETURNING   CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey
    INTO        _cancelledDeliveryFoodListingKey;

    RETURN QUERY
    SELECT  _cancelledDeliveryFoodListingKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
