SELECT dropFunction ('addOrUpdateAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addOrUpdateAvailability
(
    _appUserKey     AppUserAvailability.appUserKey%TYPE,
    _timeRanges     JSON[]
)
RETURNS VOID
AS $$
    DECLARE _startTime  AppUserAvailability.startTime%TYPE;
    DECLARE _endTime    AppUserAvailability.endTime%TYPE;
BEGIN

    -- First delete all current availability entries for the given App User.
    DELETE FROM AppUserAvailability
    WHERE       appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailability.
    FOR i IN array_lower(_timeRanges, 1) .. array_upper(_timeRanges, 1)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _startTime := convertToAvailabilityTime (utcTextToTimestamp(_timeRanges[i]->>'startTime'));
        _endTime := convertToAvailabilityTime (utcTextToTimestamp(_timeRanges[i]->>'endTime'));

        -- Perform the insert.
        INSERT INTO AppUserAvailability (appUserKey, startTime, endTime)
        VALUES      (_appUserKey, _startTime, _endTime);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM updateAvailability( 1, array[
                                        JSON_BUILD_OBJECT('startTime', '2017-12-31T12:00:00.179Z', 'endTime', '2017-12-31T23:00:00.179Z')
                                     ]
                                );

SELECT  AppUser.email,
        appUserAvailability.startTime,
        appUserAvailability.endTime
FROM AppUser
INNER JOIN AppUserAvailability ON AppUser.appUserKey = AppUserAvailability.appUserKey;
*/
