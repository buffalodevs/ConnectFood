-- Food Listings table for holding record of all food that Donors have posted.

CREATE TABLE IF NOT EXISTS FoodListingFiltersHistory
(
    foodListingKey SERIAL PRIMARY KEY
);

ALTER TABLE FoodListingsFiltersHistory ADD COLUMN IF NOT EXISTS filters JSON;
