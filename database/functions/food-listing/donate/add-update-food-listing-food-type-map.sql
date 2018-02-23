SELECT dropFunction ('addUpdateFoodListingFoodTypeMap');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateFoodListingFoodTypeMap
(
    _foodListingKey FoodListingAvailability.foodListingKey%TYPE,
    _foodTypes      FoodType[]
)
RETURNS VOID
AS $$
    DECLARE _imgCrop JSON;
BEGIN

    -- First delete all associated Food Types.
    DELETE FROM FoodListingFoodTypeMap
    WHERE       foodListingKey = _foodListingKey;

    -- Then add Food Types provided in the update (includes any old Food Types that were not removed by the user).
    FOR i IN array_lower(_foodTypes, 1) .. array_upper(_foodTypes, 1)
    LOOP
        INSERT INTO FoodListingFoodTypeMap (foodListingKey, foodType)
        VALUES      (_foodListingKey, _foodTypes[i]);
    END LOOP;
    
END;
$$ LANGUAGE plpgsql;
