/**
 * Gets delivery update notification data so that status update emails may be sent to concerned users (Donors and Receivers).
 */
SELECT dropFunction('getDeliveryUpdateNotification');
CREATE OR REPLACE FUNCTION getDeliveryUpdateNotification
(
     _deliveryFoodListingKey    DeliveryFoodListing.deliveryFoodListingKey%TYPE,                    -- This is the key of the Delivery Food Listing element that we are updating.
     _newDeliveryState          DeliveryState,
     _oldDeliveryState          DeliveryState                                       DEFAULT NULL,   -- When NULL, then this will be derived and it's assumed to be before update!
     _scheduledStartTime        DeliveryFoodListing.scheduledStartTime%TYPE         DEFAULT NULL,
     _cancelled                 BOOLEAN                                             DEFAULT FALSE,
     _cancelReason              CancelledDeliveryFoodListing.cancelReason%TYPE      DEFAULT NULL,
     _foodRejected              BOOLEAN                                             DEFAULT FALSE
)
RETURNS JSON -- DeliveryUpdateNotification object.
AS $$
BEGIN

    RETURN (
                    -- @ts-sql class="DeliveryUpdateNotification" file="/server/src/deliverer/delivery-update-notification.ts"
        SELECT      JSON_BUILD_OBJECT (
                        'foodTitle',            FoodListing.foodTitle,
                                                -- If we are not given old delivery state, then assume this is before state update and we can derive it.
                        'oldDeliveryState',     CASE WHEN (_oldDeliveryState IS NULL)   THEN    getDeliveryState (
                                                                                                    DeliveryFoodListing.scheduledStartTime,
                                                                                                    DeliveryFoodListing.startTime,
                                                                                                    DeliveryFoodListing.pickUpTime,
                                                                                                    DeliveryFoodListing.dropOffTime
                                                                                                )
                                                                                        ELSE    _oldDeliveryState
                                                END,
                        'newDeliveryState',     _newDeliveryState,
                        'scheduledStartTime',   CASE WHEN (_scheduledStartTime IS NULL) THEN DeliveryFoodListing.scheduledStartTime
                                                                                        ELSE _scheduledStartTime
                                                END,
                        'cancelled',            _cancelled,
                        'cancelReason',         _CancelReason,
                        'foodRejected',         _foodRejected,
                        'receiverSessionData',  ( SELECT sessionData FROM getAppUserSessionData(ClaimedFoodListing.receiverAppUserKey) ),
                        'donorSessionData',     ( SELECT sessionData FROM getAppUserSessionData(FoodListing.donorAppUserKey) ),
                        'delivererSessionData', ( SELECT sessionData FROM getAppUserSessionData(DeliveryFoodListing.delivererAppUserKey) )
                    )
        FROM        DeliveryFoodListing
        INNER JOIN  ClaimedFoodListing  ON  DeliveryFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
        INNER JOIN  FoodListing         ON  ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
        WHERE       DeliveryFoodListing.deliveryFoodListingKey = _deliveryFoodListingKey
    );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM getDeliveryUpdateNotification(41, 'started');
