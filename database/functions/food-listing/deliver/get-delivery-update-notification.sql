/**
 * Gets delivery update notification data so that status update emails may be sent to concerned users (Donors and Receivers).
 */
SELECT dropFunction('getDeliveryUpdateNotification');
CREATE OR REPLACE FUNCTION getDeliveryUpdateNotification
(
     _deliveryInfoKey    DeliveryInfo.deliveryInfoKey%TYPE,                             -- This is the key of the Delivery Food Listing element that we are updating.
     _newDeliveryState          DeliveryState,
     _oldDeliveryState          DeliveryState                           DEFAULT NULL,   -- When NULL, then this will be derived and it's assumed to be before update!
     _scheduledStartTime        DeliveryInfo.scheduledStartTime%TYPE    DEFAULT NULL,
     _cancelled                 BOOLEAN                                 DEFAULT FALSE,
     _cancelReason              CancelledDeliveryInfo.cancelReason%TYPE DEFAULT NULL,
     _foodRejected              BOOLEAN                                 DEFAULT FALSE
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
                                                                                                    DeliveryInfo.scheduledStartTime,
                                                                                                    DeliveryInfo.startTime,
                                                                                                    DeliveryInfo.pickUpTime,
                                                                                                    DeliveryInfo.dropOffTime
                                                                                                )
                                                                                        ELSE    _oldDeliveryState
                                                END,
                        'newDeliveryState',     _newDeliveryState,
                        'scheduledStartTime',   CASE WHEN (_scheduledStartTime IS NULL) THEN timestampToUtcText(DeliveryInfo.scheduledStartTime)
                                                                                        ELSE timestampToUtcText(_scheduledStartTime)
                                                END,
                        'cancelled',            _cancelled,
                        'cancelReason',         _CancelReason,
                        'foodRejected',         _foodRejected,
                        'receiverSessionData',  ( SELECT sessionData FROM getAppUserSessionData(ClaimInfo.receiverAppUserKey) ),
                        'donorSessionData',     ( SELECT sessionData FROM getAppUserSessionData(FoodListing.donorAppUserKey) ),
                        'delivererSessionData', ( SELECT sessionData FROM getAppUserSessionData(DeliveryInfo.delivererAppUserKey) )
                    )
        FROM        DeliveryInfo
        INNER JOIN  ClaimInfo   ON  DeliveryInfo.claimInfoKey = ClaimInfo.claimInfoKey
        INNER JOIN  FoodListing ON  ClaimInfo.foodListingKey = FoodListing.foodListingKey
        WHERE       DeliveryInfo.deliveryInfoKey = _deliveryInfoKey
    );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM getDeliveryUpdateNotification(41, 'started');
