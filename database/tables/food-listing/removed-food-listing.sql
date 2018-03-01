-- Keeps records of all removed food listings (donations).

CREATE TABLE IF NOT EXISTS RemovedFoodListing
(
    removedFoodListingKey SERIAL PRIMARY KEY
);

-- Key of Food Listing that is to be Removed.
ALTER TABLE RemovedFoodListing ADD COLUMN IF NOT EXISTS foodListingKey      INTEGER     NOT NULL REFERENCES FoodListing (foodListingKey);

-- The key of the App User who removed the Food Listing (should only be associated Donor, Receiver, or Deliverer).
ALTER TABLE RemovedFoodListing ADD COLUMN IF NOT EXISTS removedByAppUserKey INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- The reason for the removal (should be required by front-end interface).
ALTER TABLE RemovedFoodListing ADD COLUMN IF NOT EXISTS removalReason       TEXT        NOT NULL;

-- A flag determining whether or not the food's condition was judged inadequate by either a Receiver or Deliverer and was rejected.
ALTER TABLE RemovedFoodListing ADD COLUMN IF NOT EXISTS foodRejected        BOOLEAN     NOT NULL DEFAULT FALSE;

-- Timestamp of the removal.
ALTER TABLE RemovedFoodListing ADD COLUMN IF NOT EXISTS removalTime         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- Add more columns here --

CREATE INDEX IF NOT EXISTS removedFoodListing_FoodListingKeyIdx         ON RemovedFoodListing (foodListingKey);
CREATE INDEX IF NOT EXISTS removedFoodListing_RemovedByAppUserKeyIdx    ON RemovedFoodListing (removedByAppUserKey);

-- Create more indexes here --
