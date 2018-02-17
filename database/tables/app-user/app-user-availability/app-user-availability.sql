-- Holds availability (schedule) data for each user. Determines when each user is available for pickup (donor) and/or delivery (receiver).

CREATE TABLE IF NOT EXISTS AppUserAvailability
(
    appUserAvailabilityKey SERIAL PRIMARY KEY
);

-- Many to one relationship between AppUserAvailability and AppUser respectively.
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS appUserAvailabilityMetaKey INTEGER     NOT NULL REFERENCES AppUserAvailabilityMeta (appUserAvailabilityMetaKey);

-- Holds absolute availability times (which are generated from AppUserAvailabilityMeta on a weekly basis).
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS timeRange                  TSRANGE     NOT NULL;


CREATE INDEX IF NOT EXISTS appUserAvailability_appUserKeyIdx    ON AppUserAvailabilityMeta (appUserAvailabilityMetaKey);
CREATE INDEX IF NOT EXISTS appUserAvailability_timeRangeIdx     ON AppUserAvailability USING gist (timeRange);


DO $$
BEGIN

    -- Ensure we cannot add NULL TSRANGE member values for timeRange column.
    BEGIN
        ALTER TABLE AppUserAvailability ADD CONSTRAINT appUserAvailability_timeRangeMembersNotNULL CHECK (
            lower(timeRange) IS NOT NULL AND
            upper(timeRange) IS NOT NULL
        );
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping ADD CONSTRAINT (appUserAvailability_timeRangeMembersNotNULL) on timeRange column since it already exists.';
    END;

END$$;
