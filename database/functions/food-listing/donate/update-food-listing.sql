/**
 * A basic function for updating a food listing.
 * NOTE: Any arguments of NULL will be interpreted as * no update *!
 */
SELECT dropFunction('updateFoodListing');
CREATE OR REPLACE FUNCTION updateFoodListing
(
    _foodListingKey         FoodListing.foodListingKey%TYPE,                        -- The key identifier of the Food Listing to update.
    _donorAppUserKey        FoodListing.donorAppUserKey%TYPE,                       -- The Donor ID (used to check if user has rights to update Food Listing).
    _foodTypes              FoodType[]                              DEFAULT NULL,   -- What Food Types is this?
    _foodTitle              FoodListing.foodTitle%TYPE              DEFAULT NULL,   -- The title (short description) of the Food Listing.
    _needsRefrigeration     FoodListing.needsRefrigeration%TYPE     DEFAULT NULL,   -- Is the food perishable?
    _availableUntilDate     TEXT                                    DEFAULT NULL,   -- The date when the donated food will no longer be available.
    _estimatedWeight        FoodListing.estimatedWeight%TYPE        DEFAULT NULL,   -- The total weight of the Food Listing (in pounds).
    _estimatedValue         FoodListing.estimatedValue%TYPE         DEFAULT NULL,   -- The estimated value of the Food Listing (in $).
    _foodDescription        FoodListing.foodDescription%TYPE        DEFAULT NULL,   -- A (long) description of the Food Listing.
    _recommendedVehicleType VehicleType                             DEFAULT NULL,   -- Recommended vehicle to use for delivery.
    _imgUrls                TEXT[]                                  DEFAULT NULL    -- URL(s) for the image being stored/uploaded.
)
RETURNS VOID -- TODO: Return data pertaining to contacts of Receivers (Claimers) who are negatively effected by this update (for contacting them)!
AS $$
    DECLARE _availableUntilTimeStamp TIMESTAMP;
BEGIN

    -- ============ Ensure user is authorized to update Food Listing ============ --
    -- ========================================================================== --

    IF NOT EXISTS (
        SELECT 1 FROM   FoodListing
        WHERE           foodListingKey = _foodListingKey
          AND           donorAppUserKey = _donorAppUserKey
    )
    THEN
        RAISE EXCEPTION 'Either the food listing does not exist, or user not authorized.';
    END IF;


    -- =================== Handle Food Types update ====================== --
    -- =================================================================== --

    IF (_foodTypes IS NOT NULL)
    THEN

        -- First delete all associated Food Types.
        DELETE FROM FoodListingFoodTypeMap
        WHERE       foodListingKey = _foodListingKey;

        -- TODO: Get the removed Food Types in this update and notify App Users that have non-delivered claims that they were removed.

        -- Then add Food Types provided in the update (includes any old Food Types that were not removed by the user).
        FOR i IN array_lower(_foodTypes, 1) .. array_upper(_foodTypes, 1)
        LOOP
            INSERT INTO FoodListingFoodTypeMap (foodListingKey, foodType)
            VALUES      (_foodListingKey, _foodTypes[i]);
        END LOOP;

    END IF;


    -- ============= Handle available until date update ============== --
    -- =============================================================== --

    /** 
     * TODO: Find the claimers (receivers) who have not yet had this Food Listing delivered.
     *       Any receivers among these whose availability does not allow a delivery before
     *       the available until date must be marked down and notified!
     */


     -- ================ Handle all remaining updates ================ --
     -- ============================================================== --

     UPDATE FoodListing
     SET    foodTitle = _foodTitle,
            needsRefrigeration = _needsRefrigeration,
            availableUntilDate = _availableUntilDate,
            estimatedWeight = _estimatedWeight,
            estimatedValue = _estimatedValue,
            foodDescription = _foodDescription,
            recommendedVehicleType = _recommendedVehicleType
    WHERE   FoodListing.foodListingKey = _foodListingKey;

END;
$$ LANGUAGE plpgsql;

--SELECT * FROM AppUser;
--SELECT addFoodListing(1, '{ Meal, Dairy }', 'Some food with many parts!', false, '1/2/2021', 2, 'Description of food here!', NULL, 10, 'bottles');
--SELECT * FROM FoodListing;
