
-- Whenever we insert new metadata into this table, we will also compute the absolute timestamps falling on the current week and the next week for each metadata
-- and insert them into the AppUserAvailability table.
CREATE OR REPLACE FUNCTION insertAppUserAvailabilityFromMeta()
RETURNS TRIGGER
AS $$
    DECLARE _currentDOW INTEGER DEFAULT EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER;
BEGIN

    RAISE NOTICE '%', rangeToWeekdayOfWeek(NEW.metaTimeRange, 0, _currentDOW);

    INSERT INTO AppUserAvailability (appUserAvailabilityMetaKey, timeRange)
    VALUES      (NEW.appUserAvailabilityMetaKey, rangeToWeekdayOfWeek(NEW.metaTimeRange, 0, _currentDOW)),
                (NEW.appUserAvailabilityMetaKey, rangeToWeekdayOfWeek(NEW.metaTimeRange, 1, _currentDOW)),
                (NEW.appUserAvailabilityMetaKey, rangeToWeekdayOfWeek(NEW.metaTimeRange, 2, _currentDOW));

    RETURN NEW;

END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN

    BEGIN
        CREATE TRIGGER appUserAvailabilityMeta_afterInsert
        AFTER INSERT ON AppUserAvailabilityMeta
        FOR EACH ROW
        EXECUTE PROCEDURE insertAppUserAvailabilityFromMeta();
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping CREATE TRIGGER (appUserAvailabilityMeta_afterInsert) since it already exists.';
    END;

END$$;
