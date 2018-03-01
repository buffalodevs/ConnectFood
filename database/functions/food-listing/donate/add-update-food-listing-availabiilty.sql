SELECT dropFunction ('addUpdateFoodListingAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateFoodListingAvailability
(
    _foodListingKey             FoodListingAvailabilityMap.foodListingKey%TYPE,
    _availabilityTimeRanges     JSON[]
)
RETURNS VOID
AS $$
    DECLARE _availabilityKey Availability.availabilityKey%TYPE;
BEGIN

    -- First delete all current availability entries for the given Food Listing.
    DELETE FROM Availability
    WHERE       EXISTS (
                    SELECT  1
                    FROM    FoodListingAvailabilityMap
                    WHERE   FoodListingAvailabilityMap.availabilityKey = Availability.availabilityKey
                      AND   FoodListingAvailabilityMap.foodListingKey = _foodListingKey
                );

    DELETE FROM FoodListingAvailabilityMap
    WHERE       foodListingKey = _foodListingKey;


    -- Insert specific availability times for the listing/donation.
    -- NOTE: These add onto or overload the regular availabiilty times for the associated Donor App User.
    FOR i IN COALESCE(ARRAY_LOWER(_availabilityTimeRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_availabilityTimeRanges, 1), 0)
    LOOP

        _availabilityKey := addAvailability(_availabilityTimeRanges[i]);

        INSERT INTO FoodListingAvailabilityMap (foodListingKey, availabilityKey)
        VALUES      (_foodListingKey, _availabilityKey);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;
