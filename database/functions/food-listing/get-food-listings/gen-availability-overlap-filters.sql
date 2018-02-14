SELECT dropFunction('genAvailabilityOverlapFilters');
CREATE OR REPLACE FUNCTION genAvailabilityOverlapFilters
(
    _maxDistance                    INTEGER,
    _includeDeliverer               BOOLEAN,
    _matchRegularAvailability       BOOLEAN,
    _matchAvailableNow              BOOLEAN
)
RETURNS TEXT
AS $$
    DECLARE _queryFilters                   TEXT;
    DECLARE _availabilityRangeBufferTxt     TEXT;
    DECLARE _estimateAvgMph                 INTEGER;
    DECLARE _distanceGradientMiles          FLOAT;
    DECLARE _distanceGradientMeters         INTEGER;
    DECLARE _distanceGradientStepMiles      INTEGER;
    DECLARE _overlapBufferMin               INTEGER;
    DECLARE _nowRelativeToAvailabilityTimes TEXT;
BEGIN

    _queryFilters := '
        AND toUpcomingWeekday(LOWER(DonorAvailability.timeRange), (SELECT EXTRACT(DOW FROM CURRENT_DATE))::INTEGER) <= FoodListing.availableUntilDate
        AND toUpcomingWeekday(LOWER(ReceiverAvailability.timeRange), (SELECT EXTRACT(DOW FROM CURRENT_DATE))::INTEGER) <= FoodListing.availableUntilDate
        AND (FALSE -- IMPORTANT since following OR statements are dynamically generated (prevents syntax error).
    ';

    -- Setup constants used to calculate Availability Range overlap margin/buffers.
    _distanceGradientStepMiles := 5;
    _overlapBufferMin := 5;
    _estimateAvgMph := 30;

    IF (_matchAvailableNow)
    THEN
        SET TIME ZONE 'UTC'; -- Ensure we are using UTC time zone!
        -- Get current time, but relative to App User Availability timestamps.
        _nowRelativeToAvailabilityTimes := convertToAvailabilityTime(CURRENT_TIMESTAMP::TIMESTAMP);
    END IF;

    /*
        The following filters are broken down into (conservative) required time range overlaps based on distances:
        1) 5 miles / 30 mph * 60 minutes_per_hour    ~ 10 (+5) minute overlap required
        2) 10 miles / 30 mph * 60 minutes_per_hour   ~ 20 (+5) minute overlap required
        3) 15 miles / 30 mph * 60 minutes_per_hour   ~ 30 (+5) minute overlap required
        4) 20 miles / 30 mph * 60 minutes_per_hour   ~ 40 (+5) minute overlap required
        5) 25 miles / 30 mph * 60 minutes_per_hour   ~ 55 (+5) minute overlap required
        6) 30 miles / 30 mph * 60 minutes_per_hour   ~ 65 (+5) minute overlap required

        NOTE: This might NOT scale well... we may need to create time range columns on AppUserAvailability with correct minute margins and index them
                to make it scale. This would cause some denormalization though, and it would use 7x more space to store avaialbility times. Use this for now and
                hope that left hand argument to range overlap operator uses index (index left, scan right).
    */
    -- Generate Availability Range overlap conditions based on farther distance thresholds in increments of 5 mi.
    FOR i IN 0 .. 5
    LOOP

        IF (_maxDistance IS NULL OR _maxDistance > (i * _distanceGradientStepMiles))
        THEN

            _distanceGradientMiles := ((i + 1) * _distanceGradientStepMiles);
            _distanceGradientMeters := (_distanceGradientMiles * 1609.34);
            _availabilityRangeBufferTxt := '(''' || (CEIL(_distanceGradientMiles / _estimateAvgMph * 60) + _overlapBufferMin) || ' minutes'')::INTERVAL';

            _queryFilters := _queryFilters || '
                OR  (
                        ST_DWITHIN(DonorContact.gpsCoordinate, ReceiverContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
            ';

            IF (_includeDeliverer)
            THEN
                _queryFilters := _queryFilters || '
                    AND ST_DWITHIN(DelivererContact.gpsCoordinate, DonorContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
                    AND ST_DWITHIN(ReceiverContact.gpsCoordinate, DelivererContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
                ';
            END IF;


            IF (_matchRegularAvailability)
            THEN

                _queryFilters := _queryFilters || '
                    AND DonorAvailability.timeRange && TSRANGE (LOWER(ReceiverAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                UPPER(ReceiverAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ')
                ';

                IF (_includeDeliverer)
                THEN
                    _queryFilters := _queryFilters || '
                        AND DelivererAvailability.timeRange && TSRANGE (LOWER(DonorAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                        UPPER(DonorAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ')
                        AND ReceiverAvailability.timeRange && TSRANGE (LOWER(DelivererAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                        UPPER(DelivererAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ')
                        AND toUpcomingWeekday(LOWER(DelivererAvailability.timeRange), (SELECT EXTRACT(DOW FROM CURRENT_DATE))::INTEGER) <= FoodListing.availableUntilDate
                    ';
                END IF;
            
            ELSIF (_matchAvailableNow)
            THEN

                _queryFilters := _queryFilters || '
                    AND DonorAvailability.timeRange @> TSRANGE (''' || _nowRelativeToAvailabilityTimes || '''::TIMESTAMP - ' || _availabilityRangeBufferTxt || ',
                                                                ''' || _nowRelativeToAvailabilityTimes || '''::TIMESTAMP + ' || _availabilityRangeBufferTxt || ')
                    AND ReceiverAvailability.timeRange @> TSRANGE (''' || _nowRelativeToAvailabilityTimes || '''::TIMESTAMP - ' || _availabilityRangeBufferTxt || ',
                                                                   ''' || _nowRelativeToAvailabilityTimes || '''::TIMESTAMP + ' || _availabilityRangeBufferTxt || ')
                ';

            END IF;

            _queryFilters := _queryFilters || '
                )
            ';

        ELSE EXIT; -- Jump out of FOR LOOP if our max disstance filter doesn't go beyond an incremental 5 mi distance threshold.
        END IF;

    END LOOP;

    _queryFilters := _queryFilters || '
        )
    ';

    RETURN _queryFilters;

END;
$$ LANGUAGE plpgsql;


SELECT genAvailabilityOverlapFilters(10, TRUE, FALSE, TRUE);
