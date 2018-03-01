/**
 * Claims (units/parts of) a Food Listing.
 */
SELECT dropFunction('claimFoodListing');
CREATE OR REPLACE FUNCTION claimFoodListing
(
     _foodListingKey            INTEGER,                -- This is the key of the Food Listing that is being claimed.
     _receiverAppUserKey        INTEGER,                -- This is the key of the user who is claiming the Food Listing.
     _availabilityTimeRanges    JSON[]  DEFAULT NULL    -- (Absolute) Claim availability time ranges.
)
RETURNS INTEGER -- The ClaimInfo primary key.
AS $$
    DECLARE _claimInfoKey  INTEGER;
BEGIN   

    INSERT INTO ClaimInfo
    (
        receiverAppUserKey,
        foodListingKey
    )
    VALUES
    (
        _receiverAppUserKey,
        _foodListingKey
    )
    RETURNING   ClaimInfo.claimInfoKey
    INTO        _claimInfoKey;

    PERFORM addUpdateClaimAvailability(_claimInfoKey, _availabilityTimeRanges);

    RETURN _claimInfoKey;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM claimFoodListing(3, 1);
