/**
 * A basic function for removing a food listing (donation) and any associated data.
 */
SELECT dropFunction('removefoodlisting');
CREATE OR REPLACE FUNCTION removeFoodListing
(
    _foodListingKey         FoodListing.foodListingKey%TYPE,
    _donatedByAppUserKey    FoodListing.donatedByAppUserKey%TYPE,
    _deleteUnitsCount       FoodListing.availableUnitsCount%TYPE DEFAULT NULL   -- The number of units/parts that the donor wishes to remove.
                                                                                -- NOTE: Default NULL means that all units (the whole FoodListing) shall be removed.
                                                                                --       Also, only units that have not entered a delivery phase may be removed.
)
-- Return user information of (receiver/deliverer) app users who were affected by the removal of the donation.
RETURNS TABLE (
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    claimedByAppUserKey     ClaimedFoodListing.claimedByAppUserKey%TYPE,
    unclaimNotificationData JSON
)
AS $$
    DECLARE _donorOnHandUnitsCount          FoodListing.availableUnitsCount%TYPE;
    DECLARE _availableUnitsCount            FoodListing.availableUnitsCount%TYPE;
    DECLARE _claimedUnitsDeleteCount        ClaimedFoodListing.claimedUnitsCount%TYPE;
BEGIN

    DROP TABLE IF EXISTS RemovalInfo;
    CREATE TEMP TABLE RemovalInfo (
        claimedFoodListingKey   INTEGER,
        claimedByAppUserKey     INTEGER,
        unclaimNotificationData JSON
    );

    -- Make sure the food listing we are to delete exists and was donated by user issuing this command.
    IF NOT EXISTS (
        SELECT  1
        FROM    FoodListing
        WHERE   FoodListing.foodListingKey = _foodListingKey
          AND   FoodListing.donatedByAppUserKey = _donatedByAppUserKey
    )
    THEN
        RAISE EXCEPTION 'Food listing does not exist, or user not authorized as Donor.';
    END IF;

    -- Get the count of units that the Donor still has control over.
    SELECT      availableUnitsCount + COALESCE(SUM(claimedUnitsCount), 0),
                availableUnitsCount
    INTO        _donorOnHandUnitsCount,
                _availableUnitsCount
    FROM        FoodListing
    LEFT JOIN   ClaimedFoodListing ON FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
    WHERE       FoodListing.foodListingKey = _foodListingKey
    -- Donor only has control over available listings and * claimed listings that have not yet entered in delivery phase *!
      AND       NOT EXISTS (
                    SELECT 1 FROM DeliveryFoodListing
                    WHERE DeliveryFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
                )
    GROUP BY    FoodListing.foodListingKey, FoodListing.availableUnitsCount;



    -- If _deleteUnitsCount is unspecified, set it to total number of deletable (donor on hand) units.
    IF (_deleteUnitsCount IS NULL)
    THEN
        _deleteUnitsCount := _donorOnHandUnitsCount;
    -- Else if _deleteUnitsCount is greater than total number of deletable units, then throw an exception!
    ELSIF (_deleteUnitsCount > _donorOnHandUnitsCount)
    THEN
        RAISE EXCEPTION 'Number of specified units to delete are greater than number of units that donor has possesion of.';
    END IF;


    -- First get the number of claimed units that we must delete.
    -- NOTE: We only delete claimed units if we have to delete more units than the available (unclaimed) count!
    _claimedUnitsDeleteCount := CASE (_deleteUnitsCount > _availableUnitsCount)
                                    WHEN TRUE THEN (_deleteUnitsCount - _availableUnitsCount)
                                    ELSE 0
                                END;

    -- Unclaim the number of claimed units that we are to delete.
    IF (_claimedUnitsDeleteCount > 0)
    THEN
        INSERT INTO     RemovalInfo
        SELECT * FROM   unclaimFoodListing(_foodListingKey, _donatedByAppUserKey, _claimedUnitsDeleteCount);
    END IF;

    -- Remove all units from available units that are to be deleted.
    UPDATE    FoodListing
    SET       availableUnitsCount = (availableUnitsCount - _deleteUnitsCount)
    WHERE     foodListingKey = _foodListingKey
    RETURNING availableUnitsCount
    INTO      _availableUnitsCount;

    
    -- Check if all units under the Food Listing have been removed (meaning we should delete Food Listing).
    IF (_availableUnitsCount = 0
        -- No units in claimed or delivery states.
        AND NOT EXISTS(
            SELECT      1
            FROM        FoodListing
            INNER JOIN  ClaimedFoodListing  ON FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
            LEFT JOIN   DeliveryFoodListing ON ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
            WHERE       FoodListing.foodListingKey = _foodListingKey
        )
    )
    THEN

        -- Delete type associates with Food Listing.
        DELETE FROM FoodListingFoodTypeMap
        WHERE       foodListingKey = _foodListingKey;

        -- Delete the actual Food Listing.
        DELETE FROM FoodListing
        WHERE       foodListingKey = _foodListingKey;

    END IF;

    RETURN QUERY
    SELECT * FROM RemovalInfo;

END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM FoodListing;
SELECT removeFoodListing(3, 1);
SELECT * FROM FoodListing;
*/
