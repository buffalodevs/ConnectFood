/**
 * A basic function for adding a food listing.
 */
SELECT dropFunction('addfoodlisting');
CREATE OR REPLACE FUNCTION addFoodListing
(
    _donorAppUserKey        FoodListing.donorAppUserKey%TYPE,                       -- The Donor ID.
    _foodTypes              FoodType[],                                             -- What Food Types is this?
    _foodTitle              FoodListing.foodTitle%TYPE,                             -- The title (short description) of the Food Listing.
    _needsRefrigeration     FoodListing.needsRefrigeration%TYPE,                    -- Is the food perishable?
    _availableUntilDate     TEXT,                                                   -- The date when the donated food will no longer be available.
    _estimatedWeight        FoodListing.estimatedWeight%TYPE        DEFAULT NULL,   -- The estimated weight of the Food Listing (in pounds).
    _estimatedValue         FoodListing.estimatedValue%TYPE         DEFAULT NULL,   -- The estimated monetary value of the Food Listing (in $).
    _foodDescription        FoodListing.foodDescription%TYPE        DEFAULT NULL,   -- A (long) description of the Food Listing.
    _recommendedVehicleType VehicleType                             DEFAULT NULL,   -- Recommended vehicle to use for delivery.
    _imgUrls                TEXT[]                                  DEFAULT NULL    -- URL(s) for the image(s) being stored/uploaded.
)
RETURNS FoodListing.foodListingKey%TYPE -- The food listing key of the new food listing (can be used as reference for edit).
AS $$
    DECLARE _foodType                   FoodType;
    DECLARE _imgUrl                     TEXT;
    DECLARE _defaultPrimaryImg          BOOLEAN DEFAULT TRUE;
    DECLARE _availableUntilTimestamp    TIMESTAMP = utcTextToTimestamp(_availableUntilDate);
    DECLARE _foodListingKey             FoodListing.foodListingKey%TYPE;
BEGIN
    
    -- Insert the new food listing and get the food listing key for it.
    INSERT INTO FoodListing (
        donorAppUserKey,
        foodTitle,
        needsRefrigeration,
        availableUntilDate,
        estimatedWeight,
        foodDescription,
        recommendedVehicleType
    )
    VALUES (
        _donorAppUserKey,
        _foodTitle,
        _needsRefrigeration,
        _availableUntilTimestamp,
        _estimatedWeight,
        _foodDescription,
        _recommendedVehicleType
    )
    RETURNING   foodListingKey
    INTO        _foodListingKey;

    -- Insert all the food types that are associated with the new food listing.
    FOREACH _foodType IN ARRAY _foodTypes
    LOOP
        INSERT INTO FoodListingFoodTypeMap (foodListingKey, foodType)
        VALUES      (_foodListingKey, _foodType);
    END LOOP;

    -- Insert all the images that are associated with the new food listing.
    FOREACH _imgUrl IN ARRAY _imgUrls
    LOOP
        INSERT INTO FoodListingImg (foodListingKey, imgUrl, isPrimary)
        VALUES      (_foodListingKey, _imgUrl, _defaultPrimaryImg);

        _defaultPrimaryImg := FALSE;
    END LOOP;

    RETURN _foodListingKey;

END;
$$ LANGUAGE plpgsql;

--SELECT * FROM AppUser;
--SELECT addFoodListing(1, '{ Meal, Dairy }', 'Some food with many parts!', false, '1/2/2021', 2, 'Description of food here!', NULL, 10, 'bottles');
--SELECT * FROM FoodListing;
