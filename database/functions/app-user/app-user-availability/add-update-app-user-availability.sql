SELECT dropFunction ('addUpdateAppUserAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateAppUserAvailability
(
    _appUserKey                 AppUserAvailabilityMeta.appUserKey%TYPE,
    _availabilityMetaTimeRanges JSON[]
)
RETURNS VOID
AS $$
    DECLARE _startTime      TIMESTAMP;
    DECLARE _endTime        TIMESTAMP;
    DECLARE _metaTimeRange  AppUserAvailabilityMeta.metaTimeRange%TYPE;
BEGIN

    -- First delete all current availability entries for the given App User.
    DELETE FROM AppUserAvailabilityMeta
    WHERE       appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailabilityMeta.
    FOR i IN COALESCE(ARRAY_LOWER(_availabilityMetaTimeRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_availabilityMetaTimeRanges, 1), 0)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _startTime := utcTextToTimestamp(_availabilityMetaTimeRanges[i]->>'_startTime');
        _endTime := utcTextToTimestamp(_availabilityMetaTimeRanges[i]->>'_endTime');
        _metaTimeRange := TSRANGE(_startTime, _endTime, '[]');

        -- Perform the insert.
        INSERT INTO AppUserAvailabilityMeta (appUserKey, metaTimeRange)
        VALUES      (_appUserKey, _metaTimeRange);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM addOrUpdateAvailability (
                                        1,  
                                        array [
                                            JSON_BUILD_OBJECT (
                                                'startTime',    '9:00 AM',
                                                'endTime',      '1:00 PM'
                                            )
                                        ]
                                    );

SELECT  AppUser.email,
        appUserAvailability.startWeekday,
        appUserAvailability.startTime,
        appUserAvailability.endWeekday,
        appUserAvailability.endTime
FROM AppUser
INNER JOIN AppUserAvailability ON AppUser.appUserKey = AppUserAvailability.appUserKey;
*/
