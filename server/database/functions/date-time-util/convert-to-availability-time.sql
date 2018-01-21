SELECT dropFunction ('convertToAvailabilityTime');

/**
 * Converts a given TIMESTAMP to be within the week relative to all Availability TIMESTAMPS (for storage and easy comparison purposes).
 * This makes all timestamps relative to the week starting on 11/12/2017 (Sunday). All timestamps in current time will be offset from 11/12/2017.
 * NOTE: Shall be converted to a time relative to the CURRENT_TIMESTAMP whenever queried for the user!
 */
CREATE OR REPLACE FUNCTION convertToAvailabilityTime
(
    _timestampToConvert  TIMESTAMP
)
RETURNS TIMESTAMP
AS $$
    DECLARE _timestampToConvertDow  INTEGER;
    DECLARE _weekOffset             INTEGER DEFAULT 0;
BEGIN

    _timestampToConvertDow := ( SELECT EXTRACT ( DOW FROM _timestampToConvert) )::INTEGER;

    -- NOTE: Following is important since local times when converted to UTC standard timezone may move to next or previous day (which can transcend week boundaries)!
    -- If the timestamp is for next sunday then we must offset the availability date to the week after 11/12/2017 (to 11/19/2017).
    IF (_timestampToConvertDow = 0 AND _timestampToConvert::DATE > CURRENT_DATE)
    THEN
        _weekOffset := 7;
    -- If the timestamp is for the previous saturday then we must offset the availability date to the previous week before 11/12/2017 (to 11/11/2017).
    ELSIF (_timestampToConvertDow = 6 AND _timestampToConvert::DATE < CURRENT_DATE)
    THEN
        _weekOffset := -7;
    END IF;

    RETURN  setDateOnTimestamp (
                _timestampToConvert,
                2017,
                11,
                ( 12 + _weekOffset + _timestampToConvertDow ) -- 11/12/2017 is Sunday, add DOW to it to get availability timestamp.
            );

END;
$$ LANGUAGE plpgsql;


/*
DO $$
BEGIN

    RAISE NOTICE 'Old time: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'New time: %', convertToAvailabilityTime (CURRENT_TIMESTAMP::TIMESTAMP);

END$$;
*/
