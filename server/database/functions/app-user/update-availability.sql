SELECT dropFunction ('updateAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION updateAvailability
(
    _appUserKey     AppUserAvailability.appUserKey%TYPE,
    -- @ts-sql class="TimeRange" file="/shared/app-user/time-range.ts"
    _timeRanges     JSON[]
)
RETURNS VOID
AS $$
    DECLARE _weekday        INTEGER;
    DECLARE _startTime      TEXT;
    DECLARE _endTime        TEXT;
    DECLARE _weekdayDate    TEXT;
    DECLARE _startTimestamp AppUserAvailability.startTime%TYPE;
    DECLARE _endTimestamp   AppUserAvailability.endTime%TYPE;
BEGIN

    -- First delete all current availability entries for the given App User.
    DELETE FROM AppUserAvailability
    WHERE       appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailability.
    FOR i IN array_lower(_timeRanges, 1) .. array_upper(_timeRanges, 1)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _weekday := _timeRanges[i]->>'weekday';
        _startTime := _timeRanges[i]->>'startTime';
        _endTime := _timeRanges[i]->>'endTime';

        _weekdayDate := CASE (_weekday)
                            WHEN 0 THEN '11/12/2017'
                            WHEN 1 THEN '11/13/2017'
                            WHEN 2 THEN '11/14/2017'
                            WHEN 3 THEN '11/15/2017'
                            WHEN 4 THEN '11/16/2017'
                            WHEN 5 THEN '11/17/2017'
                            WHEN 6 THEN '11/18/2017'
                        END;

        _startTimestamp := TO_TIMESTAMP(_weekdayDate || ' ' || _startTime, 'MM/DD/YYYY hh12:mi AM');
        _endTimestamp := TO_TIMESTAMP(_weekdayDate || ' ' || _endTime, 'MM/DD/YYYY hh12:mi AM');

        -- Perform the insert.
        INSERT INTO AppUserAvailability (appUserKey, startTime, endTime)
        VALUES      (_appUserKey, _startTimestamp, _endTimestamp);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM updateAvailability( 1, array[JSON_BUILD_OBJECT('weekday', 0, 'startTime', '9:00 AM', 'endTime', '1:00 PM')] );

SELECT  AppUser.email,
        appUserAvailability.startTime,
        appUserAvailability.endTime
FROM AppUser
INNER JOIN AppUserAvailability ON AppUser.appUserKey = AppUserAvailability.appUserKey;
*/
