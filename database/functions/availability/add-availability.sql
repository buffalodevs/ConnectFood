SELECT dropFunction ('addAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addAvailability
(
    _availabilityTimeRange  JSON,
    _toUpcommingWeekOffset  INTEGER DEFAULT NULL,   -- If we should convert the given availability time range to an upcomming week, then this will not be NULL.
    _timezone               TEXT    DEFAULT NULL    -- Should be set if we are translating availability range to upcomming week so we can accunt for daylight savings time.
)
RETURNS Availability.availabilityKey%TYPE
AS $$
    DECLARE _startTime          TIMESTAMPTZ;
    DECLARE _endTime            TIMESTAMPTZ;
    DECLARE _timeRange          Availability.timeRange%TYPE;
    DECLARE _availabilityKey    Availability.availabilityKey%TYPE;
BEGIN

    -- Convert time in TEXT format to time in TIMESTAMPTZ format.
    _startTime := utcTextToTimestamp(_availabilityTimeRange->>'_startTime');
    _endTime := utcTextToTimestamp(_availabilityTimeRange->>'_endTime');
    _timeRange := TSTZRANGE(_startTime, _endTime, '[]');

    -- Insert Availability time ranges in generic Availability table.
    INSERT INTO Availability (timeRange)
    VALUES      (
                    CASE WHEN (_toUpcommingWeekOffset IS NOT NULL)
                        THEN rangeToWeekdayOfWeek(_timeRange, _timezone, _toUpcommingWeekOffset)
                        ELSE _timeRange
                    END
                )
    RETURNING   Availability.availabilityKey
    INTO        _availabilityKey;

    RETURN _availabilityKey;
    
END;
$$ LANGUAGE plpgsql;
