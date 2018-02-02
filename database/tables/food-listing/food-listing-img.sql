-- Contains URLs of images associated with a food listing (1 - many relationship FoodListing - FoodListingImage).

--DROP TABLE FoodListingImg CASCADE; 
CREATE TABLE IF NOT EXISTS FoodListingImg
(
    foodListingImgKey SERIAL PRIMARY KEY
);

-- Key of Food Listing that the image URL is associated with.
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS foodListingKey  INTEGER NOT NULL REFERENCES FoodListing (foodListingKey);

-- URL of the image.
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS imgUrl          TEXT    NOT NULL;

-- Flag to determine if the given image is the primary one for the associated Food Listing (NOTE: No need for index since small number of images per Food Listing).
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS isPrimary       BOOLEAN NOT NULL DEFAULT FALSE;


-- Add more columns here --

CREATE INDEX IF NOT EXISTS foodListingImg_FoodListingKey ON FoodListingImg (foodListingKey);

-- Create more indexes here --
