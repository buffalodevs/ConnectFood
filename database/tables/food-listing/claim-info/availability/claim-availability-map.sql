-- Holds (specific) availability (schedule) data for each claim on Food Listing.

CREATE TABLE IF NOT EXISTS ClaimAvailabilityMap
(
    claimAvailabilityMapKey SERIAL PRIMARY KEY
);

-- Many to one relationship between Availability and FoodListing respectively.
ALTER TABLE ClaimAvailabilityMap ADD COLUMN IF NOT EXISTS claimInfoKey     INTEGER NOT NULL REFERENCES ClaimInfo (claimInfoKey);

-- Holds an absolute time range during which the listing will be available for pickup.
ALTER TABLE ClaimAvailabilityMap ADD COLUMN IF NOT EXISTS availabilityKey  INTEGER NOT NULL REFERENCES Availability (availabilityKey);


CREATE INDEX IF NOT EXISTS claimAvailabilityMap_claimInfoKeyIdx     ON ClaimAvailabilityMap (claimInfoKey);
CREATE INDEX IF NOT EXISTS claimAvailabilityMap_availabilityKeyIdx  ON ClaimAvailabilityMap (availabilityKey);
