/**
 * Cancels the delivery of a Food Listing.
 */
SELECT dropFunction('cancelDelivery');
CREATE OR REPLACE FUNCTION cancelDelivery
(
     _deliveryInfoKey       DeliveryInfo.deliveryInfoKey%TYPE,            -- This is the key of the Delivery Food Listing that is to be cancelled.
     _cancelledByAppUserKey CancelledDeliveryInfo.cancelledByAppUserKey%TYPE,    -- This is the key of the user who is cancelling the delivery of the Food Listing.
     _cancelReason          CancelledDeliveryInfo.cancelReason%TYPE,             -- The reason why the delivery was cancelled.
     _foodRejected          RemovedFoodListing.foodRejected%TYPE                        -- TRUE if the food was rejected due to inadequate quality, FALSE if not rejected.
)
RETURNS TABLE -- Returns the Delivery that has been cancelled.
(
    cancelledDeliveryInfoKey CancelledDeliveryInfo.cancelledDeliveryInfoKey%TYPE,
    deliveryUpdateNotification      JSON
)
AS $$
    DECLARE _cancelledDeliveryInfoKey   CancelledDeliveryInfo.cancelledDeliveryInfoKey%TYPE;
    DECLARE _deliveryUpdateNotification JSON;
    DECLARE _foodListingKey             FoodListing.foodListingKey%TYPE;
BEGIN

    -- TODO: Check that the cancelling app user and delivery food listing exist!
    -- TODO: Ensure that the cancelling app user is authorized (must be associated donor, receiver, or deliverer only)!
    --       Additionally, the Donor and Receiver cannot cancel the delivery after it has been started (startTime IS NOT NULL)!
    -- TODO: Check that the cancelling app user and claimed food listing exist!

    _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryInfoKey, 'Unscheduled'::DeliveryState, NULL, NULL, TRUE, _cancelReason, _foodRejected);

    -- Mark the delivery as cancelled.
    INSERT INTO CancelledDeliveryInfo
    (
        deliveryInfoKey,
        cancelledByAppUserKey,
        cancelReason
    )
    VALUES
    (
        _deliveryInfoKey,
        _cancelledByAppUserKey,
        _cancelReason
    )
    RETURNING   CancelledDeliveryInfo.cancelledDeliveryInfoKey
    INTO        _cancelledDeliveryInfoKey;

    -- If the food has been rejected during the cancellation of the delivery, then also mark it as removed.
    IF (_foodRejected = TRUE)
    THEN

        SELECT      FoodListing.foodListingKey
        INTO        _foodListingKey
        FROM        DeliveryInfo
        INNER JOIN  ClaimInfo   ON DeliveryInfo.claimInfoKey = ClaimInfo.claimInfoKey
        INNER JOIN  FoodListing ON ClaimInfo.foodListingKey = FoodListing.foodListingKey
        WHERE       DeliveryInfo.deliveryInfoKey = _deliveryInfoKey;

        PERFORM removeFoodListing(_foodListingKey, _cancelledByAppUserKey, _cancelReason, _foodRejected);

    END IF;

    RETURN QUERY
    SELECT  _cancelledDeliveryInfoKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
