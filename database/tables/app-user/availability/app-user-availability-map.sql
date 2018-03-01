-- Contains mappings between App Users and their Availabilities
CREATE TABLE IF NOT EXISTS AppUserAvailabilityMap
(
    appUserAvailabilityMapKey SERIAL PRIMARY KEY
);

-- Many to one relationship between AppUserAvailabilityMeta and AppUser respectively.
ALTER TABLE AppUserAvailabilityMap ADD COLUMN IF NOT EXISTS appUserKey         INTEGER NOT NULL REFERENCES AppUser (appUserKey);

-- Refence availability range data in Availability table.
ALTER TABLE AppUserAvailabilityMap ADD COLUMN IF NOT EXISTS availabilityKey    INTEGER NOT NULL REFERENCES Availability (availabilityKey);


CREATE INDEX IF NOT EXISTS appUserAvailabilityMap_appUserKeyIdx        ON AppUserAvailabilityMap (appUserKey);
CREATE INDEX IF NOT EXISTS appUserAvailabilityMap_availabilityKeyIdx   ON AppUserAvailabilityMap (availabilityKey);
