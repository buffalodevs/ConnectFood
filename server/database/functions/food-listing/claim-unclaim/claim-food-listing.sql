/**
 * Claims (units/parts of) a Food Listing.
 */
SELECT dropFunction('claimFoodListing');
CREATE OR REPLACE FUNCTION claimFoodListing
(
     _foodListingKey        INTEGER,                    -- This is the key of the Food Listing that is being claimed.
     _claimedByAppUserKey   INTEGER,                    -- This is the key of the user who is claiming the Food Listing.
     _claimUnitsCount       INTEGER     DEFAULT NULL    -- The number of units/parts that are to be claimed.
                                                        -- NOTE: NULL is interpreted as * all available units *!
)
RETURNS INTEGER -- The claimedFoodListing primary key.
AS $$
    DECLARE _claimedFoodListingKey  INTEGER;
BEGIN

    -- TODO: Need to perform an edit check that ensures that the FoodListing and AppUser exist!!!
    WHERE EXISTS(SELECT 1
                 FROM AppUser TABLE
                 WHERE _claimedByAppUserKey = appUserKey);

    -- If the given units count to claim is NULL, then we are to claim all available units!
    IF (_claimUnitsCount IS NULL)
    THEN
        _claimUnitsCount := (SELECT getAvailableUnitsCount(_foodListingKey));
    --ELSE
        -- TODO: Need to perform an edit check that ensures we are not claiming more parts than what is available!!!!
    END IF;

    -- If this is a brand new claim on the food listing for this user.
    IF NOT EXISTS (
        SELECT  1
        FROM    ClaimedFoodListing
        WHERE   ClaimedFoodListing.foodListingKey = _foodListingKey
          AND   ClaimedFoodListing.claimedByAppUserKey = _claimedByAppUserKey
    )
    THEN

        -- The constraints on included insert columns will ensure that the AppUser and FoodListing exist.
        INSERT INTO ClaimedFoodListing
        (
            claimedByAppUserKey,
            foodListingKey,
            claimedUnitsCount
        )
        VALUES
        (
            _claimedByAppUserKey,
            _foodListingKey,
            _claimUnitsCount
        )
        RETURNING   ClaimedFoodListing.claimedFoodListingKey
        INTO        _claimedFoodListingKey;

    -- Else this is adding claimed units to a claim that already exists.
    ELSE

        UPDATE      ClaimedFoodListing
        SET         claimedUnitsCount = ( claimedUnitsCount + _claimUnitsCount )
        WHERE       ClaimedFoodListing.foodListingKey = _foodListingKey
          AND       ClaimedFoodListing.claimedByAppUserKey = _claimedByAppUserKey
        RETURNING   ClaimedFoodListing.claimedFoodLIstingKey
        INTO        _claimedFoodListingKey;

    END IF;

    -- VERY IMPORTANT: Update the remaining available units count!
    UPDATE  FoodListing
    SET     availableUnitsCount = (availableUnitsCount - _claimUnitsCount)
    WHERE   foodListingKey = _foodListingKey;

    RETURN _claimedFoodListingKey;

END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM ClaimedFoodListing;
SELECT * FROM claimFoodListing(3, 1, 2);
SELECT * FROM claimFoodListing(3, 2, 2);
SELECT * FROM ClaimedFoodListing;
*/
