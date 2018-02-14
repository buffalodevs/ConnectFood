SELECT dropFunction ('toUpcomingWeekday');

/**
 * Converts an avaialbility date (which only contains meaningful weekday and time) to an upcoming date realtive to today.
 */
CREATE OR REPLACE FUNCTION toUpcomingWeekday
(
    _availabilityTime   TIMESTAMP,
    _currentDOW         INTEGER
)
RETURNS TIMESTAMP
AS $$

    SELECT CURRENT_DATE + INTERVAL '1' day * ((CAST((SELECT EXTRACT(DOW FROM _availabilityTime)) AS INTEGER) - _currentDOW) % 7);

$$ LANGUAGE sql;
