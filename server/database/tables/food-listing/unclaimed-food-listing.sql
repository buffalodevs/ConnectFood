-- Keeps records of all unclaimed food listings.

--DROP TABLE UnclaimedFoodListing CASCADE; 
CREATE TABLE IF NOT EXISTS UnclaimedFoodListing
(
    unclaimedFoodListingKey SERIAL PRIMARY KEY
);

ALTER TABLE UnclaimedFoodListing ADD COLUMN IF NOT EXISTS claimedFoodListingKey INTEGER     NOT NULL REFERENCES ClaimedFoodListing (claimedFoodListingKey);

ALTER TABLE UnclaimedFoodListing ADD COLUMN IF NOT EXISTS unclaimReason         TEXT        NOT NULL;

ALTER TABLE UnclaimedFoodListing ADD COLUMN IF NOT EXISTS unclaimTime           TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS unclaimedFoodListing_ClaimedFoodListingKey ON UnclaimedFoodListing (claimedFoodListingKey);
