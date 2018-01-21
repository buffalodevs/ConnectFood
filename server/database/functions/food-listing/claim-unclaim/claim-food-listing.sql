/**
 * Claims (units/parts of) a Food Listing.
 */
SELECT dropFunction('claimFoodListing');
CREATE OR REPLACE FUNCTION claimFoodListing
(
     _foodListingKey        INTEGER,    -- This is the key of the Food Listing that is being claimed.
     _receiverAppUserKey    INTEGER     -- This is the key of the user who is claiming the Food Listing.
)
RETURNS INTEGER -- The claimedFoodListing primary key.
AS $$
    DECLARE _claimedFoodListingKey  INTEGER;
BEGIN

    -- TODO: Need to perform an edit check that ensures that the FoodListing and AppUser exist!!!
    -- TODO: Ensure that the food listing has not already been claimed!

    INSERT INTO ClaimedFoodListing
    (
        receiverAppUserKey,
        foodListingKey
    )
    VALUES
    (
        _receiverAppUserKey,
        _foodListingKey
    )
    RETURNING   ClaimedFoodListing.claimedFoodListingKey
    INTO        _claimedFoodListingKey;

    RETURN _claimedFoodListingKey;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM claimFoodListing(3, 1);
