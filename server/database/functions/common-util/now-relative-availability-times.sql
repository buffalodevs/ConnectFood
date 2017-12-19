SELECT dropFunction ('nowRelativeAvailabilityTimes');

CREATE OR REPLACE FUNCTION nowRelativeAvailabilityTimes()
RETURNS TIMESTAMP
AS $$
BEGIN

    -- Calculate the timestamp relative to start and end times in the AppUserAvailability table
    RETURN  CASE (EXTRACT(DOW FROM CURRENT_TIMESTAMP))
                WHEN 0 THEN '2017-11-12 ' || CURRENT_TIME
                WHEN 1 THEN '2017-11-13 ' || CURRENT_TIME
                WHEN 2 THEN '2017-11-14 ' || CURRENT_TIME
                WHEN 3 THEN '2017-11-15 ' || CURRENT_TIME
                WHEN 4 THEN '2017-11-16 ' || CURRENT_TIME
                WHEN 5 THEN '2017-11-17 ' || CURRENT_TIME
                WHEN 6 THEN '2017-11-18 ' || CURRENT_TIME
            END;

END;
$$ LANGUAGE plpgsql;