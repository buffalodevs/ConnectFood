-- Whenever we update existing metadata in this table, we will also update the corresponding data in the AppUserAvailability table.
CREATE OR REPLACE FUNCTION deleteAppUserAvailabilityFromMeta()
RETURNS TRIGGER
AS $$
BEGIN

    -- First, remove all old entries that need updating.
    DELETE FROM AppUserAvailability
    WHERE       AppUserAvailability.appUserAvailabilityMetaKey = OLD.appUserAvailabilityMetaKey;

    RETURN OLD;

END;
$$ LANGUAGE plpgsql;


DO $$
BEGIN

    BEGIN
        CREATE TRIGGER appUserAvailabilityMeta_beforeDelete
        BEFORE DELETE ON AppUserAvailabilityMeta
        FOR EACH ROW
        EXECUTE PROCEDURE deleteAppUserAvailabilityFromMeta();
    EXCEPTION
        WHEN duplicate_object THEN RAISE NOTICE 'Skipping CREATE TRIGGER (appUserAvailabilityMeta_beforeDelete) since it already exists.';
    END;

END$$;
