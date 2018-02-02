/**
 * Cancels the delivery of a Food Listing.
 */
SELECT dropFunction('cancelDelivery');
CREATE OR REPLACE FUNCTION cancelDelivery
(
     _deliveryFoodListingKey    DeliveryFoodListing.deliveryFoodListingKey%TYPE,            -- This is the key of the Delivery Food Listing that is to be cancelled.
     _cancelledByAppUserKey     CancelledDeliveryFoodListing.cancelledByAppUserKey%TYPE,    -- This is the key of the user who is cancelling the delivery of the Food Listing.
     _cancelReason              CancelledDeliveryFoodListing.cancelReason%TYPE,             -- The reason why the delivery was cancelled.
     _foodRejected              RemovedFoodListing.foodRejected%TYPE                        -- TRUE if the food was rejected due to inadequate quality, FALSE if not rejected.
)
RETURNS TABLE -- Returns the Delivery that has been cancelled.
(
    cancelledDeliveryFoodListingKey CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey%TYPE,
    deliveryUpdateNotification      JSON
)
AS $$
    DECLARE _cancelledDeliveryFoodListingKey    CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey%TYPE;
    DECLARE _deliveryUpdateNotification         JSON;
    DECLARE _foodListingKey                     FoodListing.foodListingKey%TYPE;
BEGIN

    -- TODO: Check that the cancelling app user and delivery food listing exist!
    -- TODO: Ensure that the cancelling app user is authorized (must be associated donor, receiver, or deliverer only)!
    --       Additionally, the Donor and Receiver cannot cancel the delivery after it has been started (startTime IS NOT NULL)!
    -- TODO: Check that the cancelling app user and claimed food listing exist!
    -- DONE
    /*IF NOT EXISTS(SELECT 1
                  FROM AppUser TABLE
                  WHERE _cancelledByAppUserKey = appUserKey)
    THEN 
        RAISE EXCEPTION 'This appUserKey does not exist';
    IF NOT EXISTS(SLECT 1
                  FROM DeliveryFoodListing TABLE
                  WHERE _deliveryFoodListingKey = deliveryFoodListingKey)
    THEN
        RAISE EXCEPTION 'This deliveryfoodListingKey does not exist in the DeliveryFoodListing table';

    -- TODO: Ensure that the cancelling app user is authorized (must be the deliverer only)!
    -- DONE
    IF NOT EXISTS(SELECT 1
                  FROM DeliveryFoodListing TABLE
                  WHERE _cancelledByAppUserKey = deliveryAppUserKey
                    AND _deliveryFoodListingKey = deliveryFoodListingKey)
    THEN 
        RAISE EXCEPTION 'This USER is not authorized to make this cancelation';   */

    _deliveryUpdateNotification := getDeliveryUpdateNotification(_deliveryFoodListingKey, 'unscheduled'::DeliveryState, NULL, NULL, TRUE, _cancelReason, _foodRejected);

    -- Mark the delivery as cancelled.
    INSERT INTO CancelledDeliveryFoodListing
    (
        deliveryFoodListingKey,
        cancelledByAppUserKey,
        cancelReason
    )
    VALUES
    (
        _deliveryFoodListingKey,
        _cancelledByAppUserKey,
        _cancelReason
    )
    RETURNING   CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey
    INTO        _cancelledDeliveryFoodListingKey;

    -- If the food has been rejected during the cancellation of the delivery, then also mark it as removed.
    IF (_foodRejected = TRUE)
    THEN

        SELECT      FoodListing.foodListingKey
        INTO        _foodListingKey
        FROM        DeliveryFoodListing
        INNER JOIN  ClaimedFoodListing  ON DeliveryFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
        INNER JOIN  FoodListing         ON ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
        WHERE       DeliveryFoodListing.deliveryFoodListingKey = _deliveryFoodListingKey;

        PERFORM removeFoodListing(_foodListingKey, _cancelledByAppUserKey, _cancelReason, _foodRejected);

    END IF;

    RETURN QUERY
    SELECT  _cancelledDeliveryFoodListingKey,
            _deliveryUpdateNotification;

END;
$$ LANGUAGE plpgsql;
