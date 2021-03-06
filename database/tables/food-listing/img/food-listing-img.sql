-- Contains URLs of images associated with a food listing (1 - many relationship FoodListing - FoodListingImage).

CREATE TABLE IF NOT EXISTS FoodListingImg
(
    foodListingImgKey SERIAL PRIMARY KEY
);

-- Key of Food Listing that the image URL is associated with.
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS foodListingKey  INTEGER NOT NULL REFERENCES FoodListing (foodListingKey);

-- URL of the full sized image (Can easily be used to generate cropped image URL by prepending cropped prefix).
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS fullImgUrl      TEXT    NOT NULL;

-- Crop boundaries for image (Maps directly to standard ClientRect JavaScript object).
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS imgCrop         JSON    NOT NULL;

-- Flag to determine if the given image is the primary one for the associated Food Listing (NOTE: No need for index since small number of images per Food Listing).
ALTER TABLE FoodListingImg ADD COLUMN IF NOT EXISTS isPrimary       BOOLEAN NOT NULL DEFAULT FALSE;


-- Add more columns here --

CREATE INDEX IF NOT EXISTS foodListingImg_FoodListingKey ON FoodListingImg (foodListingKey);

-- Create more indexes here --
