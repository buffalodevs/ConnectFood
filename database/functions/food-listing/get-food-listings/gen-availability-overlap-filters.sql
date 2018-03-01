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
    DECLARE _generalAvailabilityFilters     TEXT;
    DECLARE _specificAvailabilityFilters    TEXT;
    DECLARE _availabilityRangeBufferTxt     TEXT;
    DECLARE _estimateAvgMph                 INTEGER;
    DECLARE _distanceGradientMiles          FLOAT;
    DECLARE _distanceGradientMeters         INTEGER;
    DECLARE _distanceGradientStepMiles      INTEGER;
    DECLARE _overlapBufferMinutes           INTEGER;
BEGIN

    -- Setup constants used to calculate Availability Range overlap margin/buffers.
    _distanceGradientStepMiles := 5;
    _overlapBufferMinutes := 5;
    _estimateAvgMph := 30;
    _generalAvailabilityFilters := '';

    /*
        The following filters are broken down into (conservative) required time range overlaps based on distances:
        1) 5 miles / 30 mph * 60 minutes_per_hour    ~ 10 (+5) minute overlap required
        2) 10 miles / 30 mph * 60 minutes_per_hour   ~ 20 (+5) minute overlap required
        3) 15 miles / 30 mph * 60 minutes_per_hour   ~ 30 (+5) minute overlap required
        4) 20 miles / 30 mph * 60 minutes_per_hour   ~ 40 (+5) minute overlap required
        5) 25 miles / 30 mph * 60 minutes_per_hour   ~ 55 (+5) minute overlap required
        6) 30 miles / 30 mph * 60 minutes_per_hour   ~ 65 (+5) minute overlap required

        TODO:   This likely will NOT scale well... we may need to create time range columns on Availability with correct minute margins and index them
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
            _availabilityRangeBufferTxt := '(''' || (CEIL(_distanceGradientMiles / _estimateAvgMph * 60) + _overlapBufferMinutes) || ' minutes'')::INTERVAL';
            _specificAvailabilityFilters := '';

            -- Query filters for matching regular availability (scheduling) are defined here.
            IF (_matchRegularAvailability)
            THEN

                -- Ensure Receiver availability overlaps Donor or Food Listing availability.
                _specificAvailabilityFilters := _specificAvailabilityFilters || '
                    AND DonorAvailability.timeRange && TSTZRANGE (LOWER(ReceiverAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                  UPPER(ReceiverAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ', ''[]'')
                ' ||
                -- Ensure Deliverer availability overlaps Donor or Food Liisting availability, overlaps Receiver availability, and falls bfore Food Listing expiration.
                CASE WHEN (_includeDeliverer) THEN '
                    AND DonorAvailability.timeRange && TSTZRANGE (LOWER(DelivererAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                  UPPER(DelivererAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ', ''[]'')
                    AND ReceiverAvailability.timeRange && TSTZRANGE (LOWER(DelivererAvailability.timeRange) + ' || _availabilityRangeBufferTxt || ',
                                                                     UPPER(DelivererAvailability.timeRange) - ' || _availabilityRangeBufferTxt || ', ''[]'')
                    AND DelivererAvailability.timeRange <= TSTZRANGE (FoodListing.availableUntilDate - ' || _availabilityRangeBufferTxt || ',
                                                                      FoodListing.availableUntilDate + ' || _availabilityRangeBufferTxt || ', ''[]'')
                '
                ELSE '' END;
            
            -- Query filters for matching listings that are available for delivery now are defined here.
            ELSIF (_matchAvailableNow)
            THEN

                -- Ensure Donor/FoodListing and Receiver availability ranges contain the current time.
                _specificAvailabilityFilters := _specificAvailabilityFilters || '
                    AND DonorAvailability.timeRange @> TSTZRANGE (''' || CURRENT_TIMESTAMP || '''::TIMESTAMP - ' || _availabilityRangeBufferTxt || ',
                                                                  ''' || CURRENT_TIMESTAMP || '''::TIMESTAMP + ' || _availabilityRangeBufferTxt || ', ''[]'')
                    AND ReceiverAvailability.timeRange @> TSTZRANGE (''' || CURRENT_TIMESTAMP || '''::TIMESTAMP - ' || _availabilityRangeBufferTxt || ',
                                                                     ''' || CURRENT_TIMESTAMP || '''::TIMESTAMP + ' || _availabilityRangeBufferTxt || ', ''[]'')
                ';

            END IF;

            -- Query filters that are uniform to all types of availability matches are defined here.
            _generalAvailabilityFilters := _generalAvailabilityFilters || '
                OR  (
                        ST_DWITHIN(DonorContact.gpsCoordinate, ReceiverContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
                        AND DonorAvailability.timeRange <= TSTZRANGE (FoodListing.availableUntilDate - ' || _availabilityRangeBufferTxt || ',
                                                                      FoodListing.availableUntilDate + ' || _availabilityRangeBufferTxt || ', ''[]'')
                        AND ReceiverAvailability.timeRange <= TSTZRANGE (FoodListing.availableUntilDate - ' || _availabilityRangeBufferTxt || ',
                                                                         FoodListing.availableUntilDate + ' || _availabilityRangeBufferTxt || ', ''[]'')'
                        || CASE WHEN (_includeDeliverer) THEN '
                            AND ST_DWITHIN(DelivererContact.gpsCoordinate, DonorContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
                            AND ST_DWITHIN(ReceiverContact.gpsCoordinate, DelivererContact.gpsCoordinate, ' || FLOOR(_distanceGradientMeters) || ')
                        '
                        ELSE '' END
                        || _specificAvailabilityFilters || '
                    )
            ';

        ELSE EXIT; -- Jump out of FOR LOOP if our max distance filter doesn't go beyond an incremental 5 mi distance threshold.
        END IF;

    END LOOP;

    RETURN '
        AND (FALSE -- IMPORTANT since following OR statements are dynamically generated (prevents syntax error).
        ' || _generalAvailabilityFilters || '
        )
    ';

END;
$$ LANGUAGE plpgsql;


-- SELECT genAvailabilityOverlapFilters(10, TRUE, TRUE, FALSE);
