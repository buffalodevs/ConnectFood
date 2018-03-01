-- Holds (specific) availability (schedule) data for each food listing.

CREATE TABLE IF NOT EXISTS FoodListingAvailabilityMap
(
    foodListingAvailabilityMapKey SERIAL PRIMARY KEY
);

-- Many to one relationship between Availability and FoodListing respectively.
ALTER TABLE FoodListingAvailabilityMap ADD COLUMN IF NOT EXISTS foodListingKey     INTEGER NOT NULL REFERENCES FoodListing (foodListingKey) ON DELETE CASCADE;

-- Holds an absolute time range during which the listing will be available for pickup.
ALTER TABLE FoodListingAvailabilityMap ADD COLUMN IF NOT EXISTS availabilityKey    INTEGER NOT NULL REFERENCES Availability (availabilityKey) ON DELETE CASCADE;


CREATE INDEX IF NOT EXISTS foodListingAvailabilityMap_foodListingKeyIdx    ON FoodListingAvailabilityMap (foodListingKey);
CREATE INDEX IF NOT EXISTS foodListingAvailabilityMap_availabilityKeyIdx   ON FoodListingAvailabilityMap (availabilityKey);
