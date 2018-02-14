/**
 * Claims (units/parts of) a Food Listing.
 */
SELECT dropFunction('claimFoodListing');
CREATE OR REPLACE FUNCTION claimFoodListing
(
     _foodListingKey        INTEGER,    -- This is the key of the Food Listing that is being claimed.
     _receiverAppUserKey    INTEGER     -- This is the key of the user who is claiming the Food Listing.
)
RETURNS INTEGER -- The ClaimInfo primary key.
AS $$
    DECLARE _claimInfoKey  INTEGER;
BEGIN

    -- TODO: Need to perform an edit check that ensures that the FoodListing and AppUser exist!!!
    -- TODO: Ensure that the food listing has not already been claimed!

    
    -- DONE:
    /*IF NOT EXISTS(SELECT 1
                 FROM AppUser TABLE
                 WHERE _claimedByAppUserKey = appUserKey)
    THEN
        RAISE EXCEPTION 'This appUserKey does not exist.';
    IF NOT EXISTS(SLECT 1
                  FROM FoodListing TABLE
                  WHERE _foodListingKey = foodListingKey)
    THEN
        RAISE EXCEPTION 'This foodListingKey does not exist in the FoodListing table';
    END IF;*/
    

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

    RETURN _claimInfoKey;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM claimFoodListing(3, 1);
