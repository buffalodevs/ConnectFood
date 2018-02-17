SELECT dropFunction ('addUpdateFoodListingAvailability');

/**
 * Updates the availability times for a given App User. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateFoodListingAvailability
(
    _foodListingKey             FoodListingAvailability.foodListingKey%TYPE,
    _availabilityTimeRanges     JSON[]
)
RETURNS VOID
AS $$
    DECLARE _startTime  TIMESTAMP;
    DECLARE _endTime    TIMESTAMP;
    DECLARE _timeRange  FoodListingAvailability.timeRange%TYPE;
BEGIN

    -- First delete all current availability entries for the given Food Listing.
    DELETE FROM FoodListingAvailability
    WHERE       foodListingKey = _foodListingKey;


    -- Insert specific availability times for the listing/donation.
    -- NOTE: These add onto or overload the regular availabiilty times for the associated Donor App User.
    FOR i IN COALESCE(ARRAY_LOWER(_availabilityTimeRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_availabilityTimeRanges, 1), 0)
    LOOP

        -- Convert time in TEXT format to time in TIMESTAMP format.
        _startTime := utcTextToTimestamp(_availabilityTimeRanges[i]->>'_startTime');
        _endTime := utcTextToTimestamp(_availabilityTimeRanges[i]->>'_endTime');
        _timeRange := TSRANGE(_startTime, _endTime, '[]');

        INSERT INTO FoodListingAvailability (foodListingKey, timeRange)
        VALUES      (_foodListingKey, _timeRange);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;
