SELECT dropFunction ('convertToAvailabilityTime');

/**
 * Converts a given TIMESTAMP to be within the week relative to all Availability TIMESTAMPS (for storage and easy comparison purposes).
 * NOTE: Shall be converted to a time relative to the CURRENT_TIMESTAMP whenever queried for the user!
 */
CREATE OR REPLACE FUNCTION convertToAvailabilityTime
(
    _timestampToConvert  TIMESTAMP
)
RETURNS TIMESTAMP
AS $$
BEGIN

    RETURN  setDateOnTimestamp (
                _timestampToConvert,
                2017,
                11,
                ( 12 + (SELECT EXTRACT ( DOW FROM _timestampToConvert ))::INTEGER ) -- 11/12/2017 is Sunday, add DOW to it to get availability timestamp.
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
