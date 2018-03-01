SELECT dropFunction ('addUpdateClaimAvailability');

/**
 * Updates the availability times for a given Claim on a Food Listing. It will completely overwrite old availability times (given that they exist).
 */
CREATE OR REPLACE FUNCTION addUpdateClaimAvailability
(
    _claimInfoKey           ClaimInfo.claimInfoKey%TYPE,
    _availabilityTimeRanges JSON[]
)
RETURNS VOID
AS $$
    DECLARE _availabilityKey Availability.availabilityKey%TYPE;
BEGIN

    -- First delete all current availability entries for the given Claim (should cascade to mappings).
    DELETE FROM Availability
    WHERE       EXISTS (
                    SELECT  1
                    FROM    ClaimAvailabilityMap
                    WHERE   ClaimAvailabilityMap.availabilityKey = Availability.availabilityKey
                      AND   ClaimAvailabilityMap.claimInfoKey = _claimInfoKey
                );


    -- Insert specific availability times for the listing/donation.
    -- NOTE: These add onto or overload the regular availabiilty times for the associated Donor App User.
    FOR i IN COALESCE(ARRAY_LOWER(_availabilityTimeRanges, 1), 1) .. COALESCE(ARRAY_UPPER(_availabilityTimeRanges, 1), 0)
    LOOP

        _availabilityKey := addAvailability(_availabilityTimeRanges[i]);

        INSERT INTO ClaimAvailabilityMap (claimInfoKey, availabilityKey)
        VALUES      (_claimInfoKey, _availabilityKey);

    END LOOP;
    
END;
$$ LANGUAGE plpgsql;
