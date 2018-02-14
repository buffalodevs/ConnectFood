/**
 * Gets the delivery state that a (Delivery) Food Listing is in.
 */
SELECT dropFunction('getDeliveryState');
CREATE OR REPLACE FUNCTION getDeliveryState
(
    _scheduledStartTime TIMESTAMP,
    _startTime          TIMESTAMP,
    _pickUpTime         TIMESTAMP,
    _dropOffTime        TIMESTAMP
)
RETURNS DeliveryState -- The delivery state.
AS $$

    SELECT CASE
        WHEN (_dropOffTime IS NOT NULL)         THEN    'Dropped Off'::DeliveryState
        WHEN (_pickUpTime IS NOT NULL)          THEN    'Picked Up'::DeliveryState
        WHEN (_startTime IS NOT NULL)           THEN    'Started'::DeliveryState
        WHEN (_scheduledStartTime IS NOT NULL)  THEN    'Scheduled'::DeliveryState
        ELSE                                            'Unscheduled'::DeliveryState
    END;

$$ LANGUAGE sql;
