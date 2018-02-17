-- Holds availability (schedule) metadata for each user. The metadata describes re-occuring (weekday-time) avaialbility on a weekly basis.
-- The data is heald in a condensed time range format with each timestamp member being set relative to 11/12/2017.
-- Therefore, all valid timestamps can be in range [ 11/12/2017, 11/19/2017 ].
-- NOTE: We add an 8th day (11/19/2017) to describe time ranges that overflow from the Saturday of one week to the Sunday of the next week.

CREATE TABLE IF NOT EXISTS AppUserAvailabilityMeta
(
    appUserAvailabilityMetaKey SERIAL PRIMARY KEY
);

-- Many to one relationship between AppUserAvailabilityMeta and AppUser respectively.
ALTER TABLE AppUserAvailabilityMeta ADD COLUMN IF NOT EXISTS appUserKey     INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- Holds times relative to the week of 11/12/2017 for regular availability (condensed weekday time combos in form of timestamps).
ALTER TABLE AppUserAvailabilityMeta ADD COLUMN IF NOT EXISTS metaTimeRange  TSRANGE     NOT NULL;


CREATE INDEX IF NOT EXISTS appUserAvailabilityMeta_appUserKeyIdx ON AppUserAvailabilityMeta (appUserKey);


DO $$
BEGIN

    -- Ensure we cannot add NULL TSRANGE member values for metaTimeRange column.
    BEGIN
        ALTER TABLE AppUserAvailabilityMeta ADD CONSTRAINT appUserAvailabilityMeta_metaTimeRangeMembersNotNULL CHECK (
            lower(metaTimeRange) IS NOT NULL AND
            upper(metaTimeRange) IS NOT NULL
        );
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping ADD CONSTRAINT (appUserAvailability_metaTimeRangeMembersNotNULL) on metaTimeRange column since it already exists.';
    END;

END$$;
