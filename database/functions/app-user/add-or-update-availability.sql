SELECT dropFunction ('addOrUpdateAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addOrUpdateAvailability
(
    _appUserKey             AppUserAvailability.appUserKey%TYPE,
    _availabilityTimeRanges JSON[]
)
RETURNS VOID
AS $$
    DECLARE _startTime  TIMESTAMP;
    DECLARE _endTime    TIMESTAMP;
    DECLARE _timeRange  AppUserAvailability.timeRange%TYPE;
BEGIN

    -- First delete all current availability entries for the given App User.
    DELETE FROM AppUserAvailability
    WHERE       appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailability.
    FOR i IN COALESCE(array_lower(_availabilityTimeRanges, 1), 1) .. COALESCE(array_upper(_availabilityTimeRanges, 1), 0)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _startTime := utcTextToTimestamp(_availabilityTimeRanges[i]->>'_startTime');
        _endTime := utcTextToTimestamp(_availabilityTimeRanges[i]->>'_endTime');
        _timeRange := TSRANGE(_startTime, _endTime, '[]');

        -- Perform the insert.
        INSERT INTO AppUserAvailability (appUserKey, timeRange)
        VALUES      (_appUserKey, _timeRange);

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
