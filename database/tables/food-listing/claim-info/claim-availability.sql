-- Holds (specific) availability (schedule) data for each food listing.

CREATE TABLE IF NOT EXISTS ClaimAvailability
(
    claimAvailabilityKey SERIAL PRIMARY KEY
);

-- Many to one relationship between ClaimAvailability and FoodListing respectively.
ALTER TABLE ClaimAvailability ADD COLUMN IF NOT EXISTS foodListingKey INTEGER NOT NULL REFERENCES FoodListing (foodListingKey);

-- Holds an absolute time range during which the listing will be available for pickup.
ALTER TABLE ClaimAvailability ADD COLUMN IF NOT EXISTS timeRange      TSRANGE NOT NULL;


CREATE INDEX IF NOT EXISTS claimAvailability_foodListingKeyIdx    ON ClaimAvailability (foodListingKey);
-- NOTE: Only need plain index on end timestamp of absolute time range since we need to ensure that it falls after the current time.
--CREATE INDEX IF NOT EXISTS claimAvailability_timeRangeIdx         ON ClaimAvailability ( UPPER(timeRange) );
CREATE INDEX IF NOT EXISTS claimAvailability_timeRangeIdx         ON ClaimAvailability USING gist (timeRange);


DO $$
BEGIN

    -- Ensure we cannot add NULL TSRANGE member values for timeRange column.
    BEGIN
        ALTER TABLE ClaimAvailability ADD CONSTRAINT claimAvailability_timeRangeMembersNotNULL CHECK (
            lower(timeRange) IS NOT NULL AND
            upper(timeRange) IS NOT NULL
        );
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping ADD CONSTRAINT since it already exists.';
    END;

END$$;
