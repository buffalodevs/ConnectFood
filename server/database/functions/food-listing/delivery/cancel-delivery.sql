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
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    delivery                JSON
)
AS $$
    DECLARE _cancelledDeliveryFoodListingKey    CancelledDeliveryFoodListing.cancelledDeliveryFoodListingKey%TYPE;
    DECLARE _deliveryAppUserKey                 AppUser.appUserKey%TYPE;
BEGIN

    -- TODO: Check that the cancelling app user and claimed food listing exist!
    -- TODO: Ensure that the cancelling app user is authorized (must be the donor, receiver, or deliverer only)!
    --       Additionally, the Donor and Receiver cannot cancel the delivery after it has been started (startTime IS NOT NULL)!

    -- Create temp table to hold return results before cancellation occurs.
    CREATE TEMP TABLE CancelledDelivery
    (
        claimedFoodListingKey   INTEGER,
        deliveryFoodListingKey  INTEGER,
        delivery                JSON
    );

    -- Grab data used for getting Delivery data of the cancelled delivery.
    SELECT  DeliveryFoodListing.deliveryAppUserKey
    INTO    _deliveryAppUserKey
    FROM    DeliveryFoodListing
    WHERE   DeliveryFoodListing.deliveryFoodListingKey = _deliveryFoodListingKey;

    INSERT INTO CancelledDelivery
    SELECT * FROM getDeliveries(_deliveryAppUserKey, 0, 1, _deliveryFoodListingKey);

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
    );

    RETURN QUERY
    SELECT * FROM CancelledDelivery;

END;
$$ LANGUAGE plpgsql;
