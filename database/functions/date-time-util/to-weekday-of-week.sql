SELECT dropFunction ('timestampToWeekdayOfWeek');
SELECT dropFunction ('rangeToWeekdayOfWeek');


/**
 * Maps any timestamp to a timestamp that falls during this week (or week offset). Will preserve the time of day and weekday of the input timestamp when mapping.
 */
CREATE OR REPLACE FUNCTION timestampToWeekdayOfWeek
(
    _timestampToMap TIMESTAMPTZ,        -- The timestamp that is to be mapped.
    _origTimezone   TEXT,               -- The original timezone of the timestamp to map (important so that daylight savings may be accounted for).
    _weekOffset     INTEGER DEFAULT 0   -- Optional Week offset used to map to a different week than current one (can be negative for past week or positive for futrue week).
)
RETURNS TIMESTAMPTZ
AS $$
    DECLARE _CurrentDOW INTEGER;
    DECLARE _result     TIMESTAMPTZ;
BEGIN

    -- Perform time addition in original client timezone to take into account potential daylight savings boundary crossing.
    EXECUTE 'SET TIME ZONE ''' || _origTimezone || '''';

    _currentDOW := EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER;
    
    _result := (CURRENT_DATE::TIMESTAMP + INTERVAL '1' DAY * ( ((EXTRACT(DOW FROM _timestampToMap::TIMESTAMP)::INTEGER - _currentDOW) % 7) + (_weekOffset * 7) )
                                        + INTERVAL '1' HOUR * DATE_PART('hour', _timestampToMap)
                                        + INTERVAL '1' MINUTE * DATE_PART('minute', _timestampToMap)
                                        + INTERVAL '1' SECOND * DATE_PART('second', _timestampToMap));

    -- Return back to UTC for rest of session.
    SET TIME ZONE 'UTC';
    RETURN _result;

END;
$$ LANGUAGE plpgsql;


/**
 * Maps any timestamp range to a timestamp range that falls during this week (or week offset). Will preserve the time of day and weekday of timestamp members when mapping.
 */
CREATE OR REPLACE FUNCTION rangeToWeekdayOfWeek
(
    _rangeToMap     TSTZRANGE,          -- The time-range that is to be mapped.
    _origTimezone   TEXT,               -- The original timezone of the timestamp to map (important so that daylight savings may be accounted for).
    _weekOffset     INTEGER DEFAULT 0   -- Optional Week offset used to map to a different week than current one (can be negative for past week or positive for futrue week).
)
RETURNS TSTZRANGE
AS $$

    SELECT TSTZRANGE (
        timestampToWeekdayOfWeek(LOWER(_rangeToMap), _origTimezone, _weekOffset),
        timestampToWeekdayOfWeek(UPPER(_rangeToMap), _origTimezone, _weekOffset + (
                -- Must account for when range extends between 2 weeks (LOWER is Saturday & UPPER is Sunday).
                CASE WHEN (     EXTRACT(DOW FROM LOWER(_rangeToMap)) = 6
                            AND EXTRACT(DOW FROM UPPER(_rangeToMap)) = 0 )
                    THEN 1
                    ELSE 0
                END
            )),
        '[]'
    );

$$ LANGUAGE sql;


DO $$
BEGIN

    -- RAISE NOTICE '%', timestampToWeekdayOfWeek(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI'), 'America/New_York', 4);
    -- RAISE NOTICE '%', timestampToWeekdayOfWeek(TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI'), 'America/New_York', 4);

    -- RAISE NOTICE '%', timestampToWeekdayOfWeek(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI'), 'America/New_York', 1);
    -- RAISE NOTICE '%', timestampToWeekdayOfWeek(TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI'), 'America/New_York', 1);

    RAISE NOTICE '%', rangeToWeekdayOfWeek(TSTZRANGE(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP, TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP, '[]'), 'America/New_York', 4);
    RAISE NOTICE '%', rangeToWeekdayOfWeek(TSTZRANGE(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP, TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP, '[]'), 'America/New_York', 0);

    -- RAISE NOTICE '%', TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI');
    -- RAISE NOTICE '%', utcTextToTimestamp(timestampToUtcText(TO_TIMESTAMP('11/12/2017 6:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP));
    -- RAISE NOTICE '%', TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI');
    -- RAISE NOTICE '%', utcTextToTimestamp(timestampToUtcText(TO_TIMESTAMP('11/12/2017 23:00', 'mm/dd/yyyy HH24:MI')::TIMESTAMP));

END$$;
