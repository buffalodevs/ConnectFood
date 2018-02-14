-- Holds availability (schedule) data for each user. Determines when each user is available for pickup (donor) and/or delivery (receiver).

CREATE TABLE IF NOT EXISTS AppUserAvailability
(
    appUserAvailabilityKey SERIAL PRIMARY KEY
);

-- Many to one relationship between AppUserAvailability and AppUser respectively.
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS appUserKey     INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- Holds times relative to the week of 11/12/2017 for regular availability (condensed weekday time combos in form of timestamps).
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS timeRange      TSRANGE     NOT NULL;


CREATE INDEX IF NOT EXISTS appUserAvailability_appUserKeyIdx    ON AppUserAvailability (appUserKey);
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
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping ADD CONSTRAINT since it already exists.';
    END;

END$$;
