SELECT dropFunction ('setDateOnTimestamp');

/**
 * Sets the date of a TIMESTAMP while preserving its time data.
 */
CREATE OR REPLACE FUNCTION setDateOnTimestamp
(
    _timestampToUpdate  TIMESTAMP,
    _year               INTEGER,
    _month              INTEGER,
    _day                INTEGER
)
RETURNS TIMESTAMP
AS $$
BEGIN

    RETURN MAKE_TIMESTAMP (
        _year,
        _month,
        _day,
        ( SELECT EXTRACT ( HOUR FROM _timestampToUpdate ) )::INT,
        ( SELECT EXTRACT ( MINUTE FROM _timestampToUpdate ) )::INT,
        ( SELECT EXTRACT ( SECOND FROM _timestampToUpdate ) )::DOUBLE PRECISION
    );

END;
$$ LANGUAGE plpgsql;


/*
DO $$
BEGIN

    RAISE NOTICE 'Old time: %', CURRENT_TIMESTAMP;
    RAISE NOTICE 'New time: %', setDateOnTimestamptz (CURRENT_TIMESTAMP, 1992, 12, 12);

END$$;
*/
