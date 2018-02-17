SELECT dropFunction ('timestampToWeekdayOfWeek');
SELECT dropFunction ('rangeToWeekdayOfWeek');


/**
 * Maps any timestamp to a timestamp that falls during this week (or week offset). Will preserve the time of day and weekday of the input timestamp when mapping.
 */
CREATE OR REPLACE FUNCTION timestampToWeekdayOfWeek
(
    _timestampToMap TIMESTAMP,          -- The timestamp that is to be mapped.
    _weekOffset     INTEGER DEFAULT 0,  -- Optional Week offset used to map to a different week than current one (can be negative for past week or positive for futrue week).
    _currentDOW     INTEGER DEFAULT EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER -- Optional, can be input to improve efficiency on bulk operations.
)
RETURNS TIMESTAMP
AS $$

    SELECT CURRENT_DATE + INTERVAL '1' DAY * ( ((EXTRACT(DOW FROM _timestampToMap)::INTEGER - _currentDOW) % 7) + (_weekOffset * 7) )
                        + INTERVAL '1' HOUR * DATE_PART('hour', _timestampToMap)
                        + INTERVAL '1' MINUTE * DATE_PART('minute', _timestampToMap)
                        + INTERVAL '1' SECOND * DATE_PART('second', _timestampToMap);

$$ LANGUAGE sql;


/**
 * Maps any timestamp range to a timestamp range that falls during this week (or week offset). Will preserve the time of day and weekday of timestamp members when mapping.
 */
CREATE OR REPLACE FUNCTION rangeToWeekdayOfWeek
(
    _rangeToMap TSRANGE,            -- The time-range that is to be mapped.
    _weekOffset INTEGER DEFAULT 0,  -- Optional Week offset used to map to a different week than current one (can be negative for past week or positive for futrue week).
    _currentDOW INTEGER DEFAULT EXTRACT(DOW FROM CURRENT_TIMESTAMP)::INTEGER -- Optional, can be input to improve efficiency on bulk operations.
)
RETURNS TSRANGE
AS $$

    SELECT TSRANGE (
        timestampToWeekdayOfWeek(LOWER(_rangeToMap), _weekOffset, _currentDOW),
        timestampToWeekdayOfWeek(UPPER(_rangeToMap), _weekOffset + (
                -- Must account for when range extends between 2 weeks (LOWER is Saturday & UPPER is Sunday).
                CASE WHEN (     EXTRACT(DOW FROM LOWER(_rangeToMap)) = 6
                            AND EXTRACT(DOW FROM UPPER(_rangeToMap)) = 0 )
                    THEN 1
                    ELSE 0
                END
            ) , _currentDOW),
        '[]'
    );

$$ LANGUAGE sql;


-- SELECT timestampToWeekdayOfWeek(TO_TIMESTAMP('2017-11-18 17:00', 'yyyy-mm-dd HH24:MI')::TIMESTAMP);
-- SELECT timestampToWeekdayOfWeek(TO_TIMESTAMP('2017-11-19 00:00', 'yyyy-mm-dd HH24:MI')::TIMESTAMP);
-- SELECT rangeToWeekdayOfWeek(TSRANGE(TO_TIMESTAMP('2017-11-18 17:00', 'yyyy-mm-dd HH24:MI')::TIMESTAMP, TO_TIMESTAMP('2017-11-19 00:00', 'yyyy-mm-dd HH24:MI')::TIMESTAMP, '[]'));
