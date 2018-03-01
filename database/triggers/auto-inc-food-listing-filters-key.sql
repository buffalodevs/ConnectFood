CREATE OR REPLACE FUNCTION autoIncFoodListingFiltersKey()
RETURNS TRIGGER
AS $$
BEGIN

    -- Get the next foodListingFiltersKey for the given App User.
    NEW.foodListingFiltersKey := COALESCE (
        (
            SELECT  MAX(foodListingFiltersKey) + 1
            FROM    FoodListingFilters
            WHERE   appUserKey = NEW.appUserKey
        ),
        1 -- Default to 1 for first filters key value.
    );

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN

    BEGIN
        CREATE TRIGGER foodListingFilters_beforeInsert
        BEFORE INSERT ON FoodListingFilters
        FOR EACH ROW EXECUTE PROCEDURE autoIncFoodListingFiltersKey();
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping CREATE TRIGGER (foodListingFilters_beforeInsert) since it already exists.';
    END;

END$$;
