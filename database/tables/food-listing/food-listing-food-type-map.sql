
CREATE TABLE IF NOT EXISTS FoodListingFoodTypeMap
(
    FoodListingFoodTypeMapKey SERIAL PRIMARY KEY
);

ALTER TABLE FoodListingFoodTypeMap ADD COLUMN IF NOT EXISTS foodListingKey  INTEGER     REFERENCES FoodListing (foodListingKey);
ALTER TABLE FoodListingFoodTypeMap ADD COLUMN IF NOT EXISTS foodType        FoodType    NOT NULL;

CREATE INDEX IF NOT EXISTS foodListingFoodTypeMap_foodListingKeyIdx ON FoodListingFoodTypeMap (foodListingKey);
CREATE INDEX IF NOT EXISTS foodListingFoodTypeMap_foodTypeIdx       ON FoodListingFoodTypeMap (foodType);
