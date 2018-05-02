/**
 * A basic function for retrieving food listing filters.
 */
SELECT dropFunction('getFoodListingFilters');
CREATE OR REPLACE FUNCTION getFoodListingFilters
(
    _appUserKey             AppUser.appUserKey%TYPE,                        -- The App User Key of the current user issuing this query.
    _foodListingFiltersKey  FoodListingFilters.foodListingFiltersKey%TYPE   -- The key of the filters to be retrieved.
)
RETURNS TABLE
(
    foodListingFiltersKey   FoodListingFilters.foodListingFiltersKey%TYPE,
    foodListingFilters      JSONB
)
AS $$

    SELECT  foodListingFiltersKey, filters
    FROM    FoodListingFilters
    WHERE   appUserKey = _appUserKey
    AND   foodListingFiltersKey = _foodListingFiltersKey;

$$ LANGUAGE sql;


-- SELECT getFoodListingFilters(1, 10);
