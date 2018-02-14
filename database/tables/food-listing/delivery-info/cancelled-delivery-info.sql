-- Keeps records of all cancelled Deliveries.
-- Should only be cancelled if the deliverer cannot make the drive, or if the food has gone bad / not handled properly.

CREATE TABLE IF NOT EXISTS CancelledDeliveryInfo
(
    cancelledDeliveryInfoKey SERIAL PRIMARY KEY
);

-- Key of Delivery Food Listing that is to be Cancelled.
ALTER TABLE CancelledDeliveryInfo ADD COLUMN IF NOT EXISTS deliveryInfoKey          INTEGER     NOT NULL REFERENCES DeliveryInfo (deliveryInfoKey);

-- Key of the App User who cancelled the Delivery.
ALTER TABLE CancelledDeliveryInfo ADD COLUMN IF NOT EXISTS cancelledByAppUserKey    INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- The reason for the cancellation (should be required by front-end interface).
ALTER TABLE CancelledDeliveryInfo ADD COLUMN IF NOT EXISTS cancelReason             TEXT        NOT NULL;

-- Timestapm of the cancellation.
ALTER TABLE CancelledDeliveryInfo ADD COLUMN IF NOT EXISTS cancelTime               TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- Add more columns here --

CREATE INDEX IF NOT EXISTS cancelledDeliveryInfo_DeliveryInfoKeyIdx         ON CancelledDeliveryInfo (deliveryInfoKey);
CREATE INDEX IF NOT EXISTS cancelledDeliveryInfo_CancelledByAppUserKeyIdx   ON CancelledDeliveryInfo (cancelledByAppUserKey);

-- Create more indexes here --
