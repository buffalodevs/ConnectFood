-- Keeps records of all Deliveries (in process and finished).
-- NOTE: The timestamps are indicators of delivery status!

CREATE TABLE IF NOT EXISTS DeliveryInfo
(
    deliveryInfoKey SERIAL PRIMARY KEY
);

-- Key of Claimed Food Listing that is to be Delivered (or was delivered).
ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS claimInfoKey          INTEGER     NOT NULL REFERENCES ClaimInfo (claimInfoKey);

ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS delivererAppUserKey   INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- Indacates when the deliverer has scheduled to start delivery of the Food Listing (in the future).
ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS scheduledStartTime    TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Will be non-null if the deliverer has started the delivery (begin route to Donor for pickup).
ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS startTime             TIMESTAMP   DEFAULT NULL;

-- Will be non-null if the Food Listing has been picked up from the Donor and is on-route to the Receiver.
ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS pickUpTime            TIMESTAMP   DEFAULT NULL;

-- Will be non-null if the Food Listing has been dropped off at the Receiver destination.
ALTER TABLE DeliveryInfo ADD COLUMN IF NOT EXISTS dropOffTime           TIMESTAMP   DEFAULT NULL;

-- Add more columns here --


CREATE INDEX IF NOT EXISTS deliveryInfo_ClaimInfoKeyIdx         ON DeliveryInfo (claimInfoKey);

CREATE INDEX IF NOT EXISTS deliveryInfo_DelivererAppUserKeyIdx  ON DeliveryInfo (delivererAppUserKey);

-- Create more indexes here --
