SELECT dropFunction ('addOrUpdateAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addOrUpdateAvailability
(
    _appUserKey             AppUserAvailability.appUserKey%TYPE,
    _availabilityTimestamps JSON[]
)
RETURNS VOID
AS $$
    DECLARE _startTime      AppUserAvailability.startTime%TYPE;
    DECLARE _endTime        AppUserAvailability.endTime%TYPE;
BEGIN

    -- First delete all current availability entries for the given App User.
    DELETE FROM AppUserAvailability
    WHERE       appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailability.
    FOR i IN COALESCE(array_lower(_availabilityTimestamps, 1), 0) .. COALESCE(array_upper(_availabilityTimestamps, 1), 0)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _startTime := utcTextToTimestamp(_availabilityTimestamps[i]->>'_startTime');
        _endTime := utcTextToTimestamp(_availabilityTimestamps[i]->>'_endTime');

        -- Perform the insert.
        INSERT INTO AppUserAvailability (appUserKey, startTime, endTime)
        VALUES      (_appUserKey, _startTime, _endTime);

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
