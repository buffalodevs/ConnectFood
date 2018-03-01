-- Holds (specific) availability (schedule) data for each food listing.


CREATE TABLE IF NOT EXISTS FoodListingFiltersAvailability
(
    foodListingFiltersAvailabilityKey   SERIAL PRIMARY KEY,
    foodListingFiltersKey               INTEGER,
    appUserKey                          INTEGER,
    FOREIGN KEY (appUserKey, foodListingFiltersKey) REFERENCES FoodListingFilters (appUserKey, foodListingFiltersKey)
);

ALTER TABLE FoodListingFiltersAvailability ADD COLUMN IF NOT EXISTS availabilityKey INTEGER NOT NULL REFERENCES Availability (availabilityKey);


CREATE INDEX IF NOT EXISTS foodListingAvailability_foodListingFiltersIdx    ON FoodListingFiltersAvailability (appUserKey, foodListingFiltersKey);
CREATE INDEX IF NOT EXISTS foodListingAvailability_availabilityKeyIdx       ON FoodListingFiltersAvailability (availabilityKey);
