SELECT dropFunction('unclaimFoodListing');
CREATE OR REPLACE FUNCTION unclaimFoodListing
(
    _foodListingKey         ClaimedFoodListing.foodListingKey%TYPE,                     -- This is the key of the Food Listing that is being unclaimed.
    _unclaimedByAppUserKey  ClaimedFoodListing.claimedByAppUserKey%TYPE,                -- This is the key of the user who is unclaiming the Food Listing (Donor or Receiver).
    _unclaimUnitsCount      ClaimedFoodListing.claimedUnitsCount%TYPE   DEFAULT NULL    -- The number of units/parts that the Receiver is unclaiming.
                                                                                        -- NOTE: NULL is interpreted as * all units *!
)
-- Return user information of (receiver/deliverer) app users who were affected by the unclaim.
RETURNS TABLE (
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    claimedByAppUserKey     ClaimedFoodListing.claimedByAppUserKey%TYPE,
    unclaimNotificationData JSON
)
AS $$
    DECLARE _unclaimedByDonor               BOOLEAN DEFAULT FALSE;  -- Flag to determine if unclaimedByAPpUserKey is for Donor or Receiver.
    DECLARE _totalClaimedUnitsCount         INTEGER DEFAULT 0;      -- Determines total number of claimed units that can be unclaimed based on filter criteria (inputs).
    DECLARE _remainingUnitsToUnclaim        INTEGER;                -- Keeps track of the remaining units left to be unclaimed (especially when triggered by removeFoodListing()).
    DECLARE _unclaimUnitsCountForListing    INTEGER;                -- Determs the number of units that are to be or were unclaimed for a single listing.
    DECLARE _foodTitle                      TEXT;
    DECLARE _unitsLabel                     TEXT;
    DECLARE _unclaimCandidate               RECORD;                 -- A row in the UnclaimCandidates TEMP TABLE defined below.
BEGIN

    -- Create a temporary table that will be filled with all of the Claimed Food Listing candidates for unclaiming (based on function args).
    DROP TABLE IF EXISTS UnclaimCandidates;
    CREATE TEMP TABLE UnclaimCandidates
    (
        claimedFoodListingKey       INTEGER,
        claimedByAppUserKey         INTEGER,
        originalClaimedUnitsCount   INTEGER,
        claimedDate                 TIMESTAMP,
        deliveryFoodListingKey      INTEGER,
        deliveryAppUserKey          INTEGER,
        -- Following data is pertaining to how these candidates are affected by the unclaim action (Needed for final return data).
        unclaimedUnitsCount         INTEGER     DEFAULT 0
    );


    -- Determine if the unclaiming app user is the Donor (TRUE) or Receiver (FALSE).
    IF EXISTS (
        SELECT  1
        FROM    FoodListing
        WHERE   FoodListing.donatedByAppUserKey = _unclaimedByAppUserKey
    )
    THEN
        _unclaimedByDonor := TRUE;
    -- If not the Donor, then make sure it is the Receiver who is performing the unclaim.
    ELSIF NOT EXISTS (
        SELECT  1
        FROM    ClaimedFoodListing
        WHERE   ClaiemdFoodListingKey.claimedByAppUserKey = _unclaimdByAppUserKey
    )
    THEN
        -- If here, then neither Receiver nor Donor are the source of the unclaim, and we must prevent unauthorized unclaim!
        RAISE EXCEPTION 'User not authroized to unclaim the given Claiemd Food Listing since they are not its Donor or Receiver.';
    END IF;


    -- Grab all of the keys of Claimed Food Listings that are candidates for being unclaimed.
    -- NOTE: The result set here should be very small (<= 3 rows on average).
    INSERT INTO UnclaimCandidates
    SELECT      ClaimedFoodListing.claimedFoodListingKey,
                ClaimedFoodListing.claimedByAppUserKey,
                ClaimedFoodListing.claimedUnitsCount,
                ClaimedFoodListing.claimedDate,
                DeliveryFoodListing.deliveryFoodListingKey,
                DeliveryFOodListing.deliveryAppUserKey
    FROM        ClaimedFoodListing
    LEFT JOIN   DeliveryFoodListing ON  ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
                                    -- Make sure we don't include delivery info of cancelled deliveries!
                                    AND NOT EXISTS (
                                        SELECT  1
                                        FROM    CancelledDeliveryFoodListing
                                        WHERE   CancelledDeliveryFoodListing.deliveryFoodListingKey = DeliveryFoodListing.deliveryFoodListingKey
                                    )
    WHERE       foodListingKey = _foodListingKey
      -- If unclaimed by Donor, then we can remove units from all claims of given food listing. But, if unclaimed by Receiver, only Receiver's claim is subject!
      AND       (_unclaimedByDonor OR ClaimedFoodListing.claimedByAppUserKey = _unclaimedByAppUserKey)
      -- The claimed food listings (to be unclaimed) should not have yet entered the started delivery state!
      AND       DeliveryFoodListing.startTime IS NULL;

    -- Grab the total number of Claimed Food Listing units among the unclaim candidates for edit check.
    SELECT      SUM(originalClaimedUnitsCount)
    INTO        _totalClaimedUnitsCount
    FROM        UnclaimCandidates;


    -- Make sure the claimed food listing we are to delete exists.
    IF (_totalClaimedUnitsCount = 0 OR _totalClaimedUnitsCount IS NULL)
    THEN
        RAISE NOTICE '_totalClaimedUnitsCount: %', _totalClaimedUnitsCount;
        RAISE EXCEPTION 'Either the claimed food listing does not exist, or the current user is not authroized to unclaim the given listing.';
    END IF;

    -- Make sure we are not removing more claimed Food Listing units (parts) than we have.
    IF (_unclaimUnitsCount IS NOT NULL AND _unclaimUnitsCount > _totalClaimedUnitsCount)
    THEN
        RAISE EXCEPTION 'Attempting to unclaim more food listing units than the number that exists.';
    END IF;

    -- Make sure that we have a positive non-zero number of units we are unclaiming
    IF (_unclaimUnitsCount <= 0)
    THEN
        RAISE EXCEPTION 'Attempting to unclaim 0 or a negative number of units';
    END IF;

    -- If the number of units to remove is unspecified, then assign it to total number of claimed units under the Food Listing.
    IF (_unclaimUnitsCount IS NULL)
    THEN
        _unclaimUnitsCount := _totalClaimedUnitsCount;
    END IF;


    -- Get rid of claims by removing specified number of units from each claimed food listing matching function arguments.
    -- If given a specific App User who originally claimed the listing, then we will only be interacting with one claim here (single iteration).
    -- If not given specific App User, then will be looping through all claims on the given Food Listing in order from youngest claim to oldest.
    _remainingUnitsToUnclaim := _unclaimUnitsCount;
    FOR _unclaimCandidate IN (
        SELECT      *
        FROM        UnclaimCandidates
        ORDER BY    claimedDate DESC
    )
    LOOP

        -- Determine number of units to unclaim based on remaining units to unclaim and number of units on claim.
        _unclaimUnitsCountForListing := CASE (_unclaimCandidate.originalClaimedUnitsCount <= _remainingUnitsToUnclaim)
                                            WHEN TRUE THEN  _unclaimCandidate.originalClaimedUnitsCount
                                            ELSE            _remainingUnitsToUnclaim
                                        END;

        -- Update the claim units count.
        UPDATE  ClaimedFoodListing
        SET     claimedUnitsCount = ( claimedUnitsCount - _unclaimUnitsCountForListing )
        WHERE   ClaimedFoodListing.claimedFoodListingKey = _unclaimCandidate.claimedFoodListingKey;

        -- If we removed all units, and there's a scheduled delivery, then we must cancel the delivery.
        IF (    _unclaimUnitsCountForListing = _unclaimCandidate.originalClaimedUnitsCount
            AND _unclaimCandidate.deliveryFoodListingKey IS NOT NULL )
        THEN

            -- If we have delivery scheduled for completely unclaimed food listing, then cancel the delivery.
            PERFORM cancelDelivery (
                _unclaimCandidate.deliveryFoodListingKey,
                _unclaimedByAppUserKey,
                CASE(_unclaimedByDonor)
                    WHEN TRUE THEN  'The Donor has removed some or all units on Food Listing causing Scheduled Delivery cancellation.'
                    WHEN FALSE THEN 'The Receiver has unclaimed the Claimed Food Listing causing Scheduled Delivery cancellation.'
                END,
                FALSE
            );

        END IF;

        -- Make sure to update unclaim candidates data to mark this candidate as affected for purpose of generating return value.
        UPDATE  UnclaimCandidates
        SET     unclaimedUnitsCount = _unclaimUnitsCountForListing
        WHERE   UnclaimCandidates.claimedFoodListingKey = _unclaimCandidate.claimedFoodListingKey;

        _remainingUnitsToUnclaim := ( _remainingUnitsToUnclaim - _unclaimUnitsCountForListing ); -- Update the number of remaining Claimed Food Listing units.
        EXIT WHEN (_remainingUnitsToUnclaim <= 0); -- Exit loop here since we have removed all of the units from ClaimedFoodListings fitting argument criteria.
    
    END LOOP;

    -- VERY IMPORTANT: Update the available units count (also grab food title and units label for return while doing so)!
    UPDATE      FoodListing
    SET         availableUnitsCount = (availableUnitsCount + _unclaimUnitsCount)
    WHERE       foodListingKey = _foodListingKey
    RETURNING   FoodListing.foodTitle, FoodListing.unitsLabel
    INTO        _foodTitle, _unitsLabel;


    -- Retrun all information pertaining to affected App Users (Receivers who lost claims and Deliverers who lost scheduled deliveries).
    RETURN QUERY
    SELECT      UnclaimCandidates.claimedFoodListingKey,
                UnclaimCandidates.claimedByAppUserKey,
                -- @ts-sql class="UnclaimNotification" file="/server/src/receiver-donor/common-receiver-donor/unclaim-notification.ts"
                JSON_BUILD_OBJECT (
                    'foodTitle',            _foodTitle,
                    'oldClaimedUnitsCount', UnclaimCandidates.originalClaimedUnitsCount,
                    'newClaimedUnitsCount', ( UnclaimCandidates.originalClaimedUnitsCount - UnclaimCandidates.unclaimedUnitsCount ),
                    'unitsLabel',           _unitsLabel,
                    'receiverSessionData',  ( SELECT sessionData FROM getAppUserSessionData(UnclaimCandidates.claimedByAppUserKey) ),
                    'delivererSessionData', CASE
                                                WHEN UnclaimCandidates.deliveryAppUserKey IS NOT NULL
                                                     THEN ( SELECT sessionData FROM getAppUserSessionData(UnclaimCandidates.deliveryAppUserKey) )
                                                ELSE NULL
                                            END
                ) AS unclaimNotificationData
    -- Results from here should be very small in number, and therefore, this shouldn't be inefficient without indexes.
    FROM        UnclaimCandidates
    WHERE       UnclaimCandidates.unclaimedUnitsCount > 0;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM unclaimFoodListing(52, 1, 100);
