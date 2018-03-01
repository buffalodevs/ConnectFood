-- Holds (specific) availability (schedule) data for each food listing.

CREATE TABLE IF NOT EXISTS Availability
(
    availabilityKey SERIAL PRIMARY KEY
);

-- Holds an absolute time range during which the listing will be available for pickup.
ALTER TABLE Availability ADD COLUMN IF NOT EXISTS timeRange TSTZRANGE NOT NULL;


CREATE INDEX IF NOT EXISTS availability_timeRangeIdx ON Availability USING gist (timeRange);


DO $$
BEGIN

    -- Ensure we cannot add NULL TSTZRANGE member values for timeRange column.
    BEGIN
        ALTER TABLE Availability ADD CONSTRAINT availability_timeRangeMembersNotNULL CHECK (
            lower(timeRange) IS NOT NULL AND
            upper(timeRange) IS NOT NULL
        );
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping ADD CONSTRAINT since it already exists.';
    END;

END$$;
