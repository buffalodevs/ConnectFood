-- Table for holding basic Deliverer (License) Info.

CREATE TABLE IF NOT EXISTS DelivererInfo
(
    delivererInfoKey SERIAL PRIMARY KEY
);


ALTER TABLE DelivererInfo ADD COLUMN IF NOT EXISTS appUserKey           INTEGER         NOT NULL UNIQUE REFERENCES AppUser (appUserKey);
ALTER TABLE DelivererInfo ADD COLUMN IF NOT EXISTS driversLicenseState  CHAR(2)         NOT NULL;
ALTER TABLE DelivererInfo ADD COLUMN IF NOT EXISTS driversLicenseID     CHAR(11)        NOT NULL;
