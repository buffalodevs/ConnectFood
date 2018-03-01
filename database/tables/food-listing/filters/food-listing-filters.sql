-- Food Listings table for holding record of all food that Donors have posted.

CREATE TABLE IF NOT EXISTS FoodListingFilters
(
    appUserKey              INTEGER REFERENCES AppUser (appUserKey),
    foodListingFiltersKey   INTEGER NOT NULL, -- Will be auto-incremented per App User via trigger fn.

    PRIMARY KEY (appUserKey, foodListingFiltersKey)
);


ALTER TABLE FoodListingFilters ADD COLUMN IF NOT EXISTS filters     JSONB;
