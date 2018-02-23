SELECT dropFunction('refreshAppUserAvailabilityFromMeta');


/**
 * Refreshes all absolute AppUserAvailability timestamp ranges based on associated metadata in AppUserAvailabilityMeta.
 * Generates absolute timestamp ranges for the following 2 weeks (this week and the next). Removes all absolute timestamp ranges on the previous week.
 * NOTE: This should not be directly invoked, but should be invoked by some sort of cron job on a regular basis.
 */
CREATE OR REPLACE FUNCTION refreshAppUserAvailabilityFromMeta()
RETURNS VOID
AS $$
    DECLARE _currentDOW INTEGER DEFAULT NULL;
BEGIN

    SET TIME ZONE 'UTC';
    _currentDOW := COALESCE(_currentDOW, EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER);

    -- Generate absolute AppUserAvailability timestamp ranges for 3 weeks later (next 2 weeks should have already been generated).
    INSERT INTO AppUserAvailability (appUserAvailabilityMetaKey, timeRange)
    SELECT      AppUserAvailabilityMeta.appUserAvailabilityMetaKey,
                rangeToWeekdayOfWeek(AppUserAvailabilityMeta.metaTimeRange, 2, _currentDOW)
    FROM        AppUserAvailabilityMeta;

    -- Remove all old AppUserAvailability timestamp ranges.
    DELETE FROM AppUserAvailability
    WHERE       AppUserAvailability.timeRange << TSRANGE(CURRENT_TIMESTAMP::TIMESTAMP, CURRENT_TIMESTAMP::TIMESTAMP, '[]');

END;
$$ LANGUAGE plpgsql;


SELECT * FROM AppUserAvailabilityMeta;
SELECT refreshAppUserAvailabilityFromMeta();
SELECT * FROM AppUserAvailability;
