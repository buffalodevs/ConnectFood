-- Holds availability (schedule) data for each user. Determines when each user is available for pickup (donor) and/or delivery (receiver).

DROP TABLE AppUserAvailability CASCADE;
CREATE TABLE IF NOT EXISTS AppUserAvailability
(
    appUserAvailabilityKey SERIAL PRIMARY KEY
);

-- Many to one relationship between AppUserAvailability and AppUser respectively.
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS appUserKey INTEGER     NOT NULL REFERENCES AppUser (appUserKey);

-- The time that the user will be available. Stored as a timestamp during the week of 11/12/2017 (to keep day of week data in condensed form with time).
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS startTime  TIMESTAMP   NOT NULL;
ALTER TABLE AppUserAvailability ADD COLUMN IF NOT EXISTS endTime    TIMESTAMP   NOT NULL;    


CREATE INDEX IF NOT EXISTS appUserAvailability_appUserKeyIdx    ON AppUserAvailability (appUserKey);
CREATE INDEX IF NOT EXISTS appUserAvailability_startTimeIdx     ON AppUserAvailability (startTime);
CREATE INDEX IF NOT EXISTS appUserAvailability_endTimeIdx       ON AppUserAvailability (endTime);
