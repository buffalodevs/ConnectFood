/**
 * A basic search function for retrieving food listings that meet specific criteria.
 * NOTE: This may need to be further optimized given that it will be dealing with a large amount of rows.
 *       -One idea is to combine the dynamic query and return query and just do the group by in one return query. The query optimizer may come through here.
 */
SELECT dropFunction('addFoodListingFilters');
CREATE OR REPLACE FUNCTION addFoodListingFilters
(
    _appUserKey         AppUser.appUserKey%TYPE,    -- The App User Key of the current user issuing this query.
    _filters            JSON DEFAULT NULL           -- The filters to be applied to query.
)
RETURNS FoodListingFilters.foodListingFiltersKey%TYPE
AS $$
    DECLARE _foodListingFiltersKey      FoodListingFilters.foodListingFiltersKey%TYPE;
    DECLARE _specificAvailabilityRanges JSON[];
    DECLARE _availabilityKey            Availability.availabilityKey%TYPE;
BEGIN

    -- Make sure we do not have a NULL _filters input.
    INSERT INTO FoodListingFilters (appUserKey, filters)
    VALUES      (_appUserKey, _filters)
    RETURNING   FoodListingFilters.foodListingFiltersKey
    INTO        _foodListingFiltersKey;

    _specificAvailabilityRanges := jsonArrToPostgresTextArr(_filters->'specificAvailabilityTimes');
    FOR i IN COALESCE(ARRAY_LOWER(_specificAvailabilityRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_specificAvailabilityRanges, 1), 0)
    LOOP

        _availabilityKey := addAvailability(_specificAvailabilityRanges[i]);

        INSERT INTO FoodListingFiltersAvailability (foodListingFiltersKey, appUserKey, availabilityKey)
        VALUES      (_foodListingFiltersKey, _appUserKey, _availabilityKey);

    END LOOP;

    return _foodListingFiltersKey;

END;
$$ LANGUAGE plpgsql;
