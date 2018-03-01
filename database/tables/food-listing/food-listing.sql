-- Food Listings table for holding record of all food that Donors have posted.

CREATE TABLE IF NOT EXISTS FoodListing
(
    foodListingKey SERIAL PRIMARY KEY
);

--The Posted by key refers to the app user organization map key
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS donorAppUserKey            INTEGER         NOT NULL REFERENCES AppUser (appUserKey);

ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS foodTitle                  VARCHAR(30)     NOT NULL;

ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS foodDescription            TEXT            DEFAULT NULL;

ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS needsRefrigeration         BOOLEAN         NOT NULL;

-- The date on which the Food Listing was initially donated.
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS donationDate               TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- The date on which the Food Listing becomes no longer available.
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS availableUntilDate         TIMESTAMPTZ     NOT NULL;

-- Contains the total weight of the entire Food Listing in pounds.
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS estimatedWeight            NUMERIC(6, 2)   DEFAULT NULL;

-- The estimated monetary value of the Food Listing (in $).
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS estimatedValue             NUMERIC(6, 2)   DEFAULT NULL;

-- The recommended vehicle type (size) for food delivery.
ALTER TABLE FoodListing ADD COLUMN IF NOT EXISTS recommendedVehicleType     VehicleType     NOT NULL;


-- Add more columns here --

CREATE INDEX IF NOT EXISTS foodListing_DonorAppUserKeyIdx   ON FoodListing (donorAppUserKey);

CREATE INDEX IF NOT EXISTS foodListing_AvailableUntilDate   ON FoodListing (availableUntilDate);

-- Create more indexes here --
