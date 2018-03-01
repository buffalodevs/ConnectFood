SELECT dropFunction ('addUpdateFoodListingImg');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateFoodListingImg
(
    _foodListingKey FoodListing.foodListingKey%TYPE,
    _imgData        JSON[]
)
RETURNS VOID
AS $$
BEGIN

    -- First delete all current food listing image entries for the given Food Listing.
    DELETE FROM FoodListingImg
    WHERE       foodListingKey = _foodListingKey;


    FOR i IN COALESCE(ARRAY_LOWER(_imgData, 1), 1) .. COALESCE(ARRAY_UPPER(_imgData, 1), 0)
    LOOP

        INSERT INTO FoodListingImg
        (
            foodListingKey,
            fullImgUrl,
            imgCrop,
            isPrimary
        )
        VALUES
        (
            _foodListingKey,
            (_imgData[i]->>'fullImgUrl')::TEXT,
            _imgData[i]->'imgCrop',
            (i = 0)
        );

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;
