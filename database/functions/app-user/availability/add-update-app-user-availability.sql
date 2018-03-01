SELECT dropFunction ('addUpdateAppUserAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateAppUserAvailability
(
    _appUserKey                 AppUserAvailabilityMap.appUserKey%TYPE,
    _availabilityMetaTimeRanges JSON[],
    _timezone                   TEXT
)
RETURNS VOID
AS $$
    DECLARE _availabilityKey    Availability.availabilityKey%TYPE;
BEGIN

    -- First remove any existing availability elements or the given user (in case of update).
    DELETE FROM Availability
    WHERE       EXISTS (
                    SELECT  1
                    FROM    AppUserAvailabilityMap
                    WHERE   AppUserAvailabilityMap.availabilityKey = Availability.availabilityKey
                      AND   AppUserAvailabilityMap.appUserKey = _appUserKey
                );

    DELETE FROM AppUserAvailabilityMap
    WHERE       AppUserAvailabilityMap.appUserKey = _appUserKey;


    -- Iterate through all time ranges in _timeRanges argument, and add them into AppUserAvailabilityMeta.
    FOR i IN COALESCE(ARRAY_LOWER(_availabilityMetaTimeRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_availabilityMetaTimeRanges, 1), 0)
    LOOP

        -- Generate availability for this week [0] and next 2 weeks [1, 2]
        FOR weekOffset IN 0 .. 2
        LOOP

            _availabilityKey := addAvailability(_availabilityMetaTimeRanges[i], weekOffset, _timezone);

            -- Record Availability as App User Availability.
            INSERT INTO AppUserAvailabilityMap (appUserKey, availabilityKey)
            VALUES      (_appUserKey, _availabilityKey);

        END LOOP;

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;


SET TIME ZONE 'UTC';
SELECT * FROM addUpdateAppUserAvailability (
    1,
    array [
        JSON_BUILD_OBJECT (
            '_startTime',    timestampToUtcText(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI')),
            '_endTime',      timestampToUtcText(TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI'))
        )
    ],
    'America/New_York'
);
