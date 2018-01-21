/**
 * A basic search function for retrieving food listings that meet specific criteria.
 * NOTE: This may need to be further optimized given that it will be dealing with a large amount of rows.
 *       -One idea is to combine the dynamic query and return query and just do the group by in one return query. The query optimizer may come through here.
 */
SELECT dropFunction('getFoodListings');
CREATE OR REPLACE FUNCTION getFoodListings
(
    _appUserKey                 AppUser.appUserKey%TYPE,                            -- The App User Key of the current user issuing this query.
    _retrievalOffset            INTEGER,                                            -- The offset of records that should be retrieved.
    _retrievalAmount            INTEGER,                                            -- The number of records that should be retrieved starting at _retrievalOffset.
    _foodListingKey             FoodListing.foodListingKey%TYPE     DEFAULT NULL,   -- This is for when we are looking for a specific Food Listing.
    _foodTypes                  FoodType[]                          DEFAULT NULL,   -- This is when we may be filtering by one or many food types. Null is for all food types.
    _needsRefrigeration         FoodListing.needsRefrigeration%TYPE DEFAULT NULL,   -- Are we looking for perishable food? Input true for perishable only, false for non-perishable, and null for both.
    _availableAfterDate         TEXT                                DEFAULT NULL,   -- Do we require food that is going to be available on or after a given date? Must be in the format MM/DD/YYYY!
    _unclaimedOnly              BOOLEAN                             DEFAULT FALSE,  -- to TRUE if only unclaimed results should come back (When browsing Receive tab for claimable Food Listings).
    _myDonatedItemsOnly         BOOLEAN                             DEFAULT FALSE,  -- Set to TRUE if only Donor Cart items should come back (this user's donated Food Listings only).
    _myClaimedItemsOnly         BOOLEAN                             DEFAULT FALSE,  -- Set to TRUE if only Receiver Cart items should come back (this user's claimed Food Listings only).
    _matchRegularAvailability   BOOLEAN                             DEFAULT TRUE    -- Determines if the items that are viewed were donated by a Donor whose availability overlaps this user's.
)
RETURNS TABLE
(
    foodListingKey      FoodListing.foodListingKey%TYPE,
    foodListing         JSON
)
AS $$
    DECLARE _currentWeekday     INTEGER; -- [0, 6] range representing days of week.
    DECLARE _queryBase          VARCHAR(4000);
    DECLARE _queryFilters       VARCHAR(2000);
    DECLARE _queryGroupAndSort  VARCHAR(2000);
BEGIN

-- ================= Preprocessing Phase - Check input values and recalculate if needed ================== --
-- ======================================================================================================= --

    -- Is the user concerned with matching Donor availability with their own?
    _matchRegularAvailability := (    _matchRegularAvailability
                                  -- If either of following are TRUE, then we are in cart and don't care about availability!
                                  AND _myDonatedItemsOnly <> TRUE
                                  AND _myClaimedItemsOnly <> TRUE);


-- ==================================== Dynamic Query Generation Phase ======================================= --
-- =========================================================================================================== --

    -- We will fill this table with our filtered food listings' key identifiers and pre-grouped data.
    DROP TABLE IF EXISTS FiltFoodListing;
    CREATE TEMP TABLE FiltFoodListing
    (
        foodListingKey  INTEGER PRIMARY KEY,
        orderNumber     SERIAL
    );


    -- We will pull back the filtered aggregate food listing keys. This query, without the group by aggregate,
    -- would pull back rows that have duplicate values for each member other than the food type column(s).
    _queryBase := '
        INSERT INTO FiltFoodListing
        SELECT      FoodListing.foodListingKey
        FROM        FoodListing
        INNER JOIN  FoodListingFoodTypeMap ON FoodListing.foodListingKey = FoodListingFoodTypeMap.foodListingKey
    ';

    _queryFilters := '
        WHERE ($1 IS NULL   OR FoodListing.foodListingKey = $1)
          -- We will translate the list of food type descriptions into integer keys for lookup efficiency.
          AND ($2 IS NULL   OR FoodListingFoodTypeMap.foodType = ANY($2))
          AND ($3 IS NULL   OR FoodListing.needsRefrigeration = $3)
          AND ($4 IS NULL   OR FoodListing.availableUntilDate >= $4)
          AND ($5 IS NULL   OR FoodListing.donorAppUserKey = $5)
          -- Ensure that food listing has not been removed.
          -- NOTE: Transofrming this into a left join combined with an IS NULL where clause check may be more efficient!!!
          AND NOT EXISTS (
              SELECT    1
              FROM      RemovedFoodListing
              WHERE     RemovedFoodListing.foodListingKey = FoodListing.foodListingKey
          )
    ';


    -- Do we want to exclude all claimed food listings?
    IF (_unclaimedOnly = TRUE)
    THEN

        -- If we have at least 1 member in ClaimedFoodListing for our FoodListing that we are examining, then it has been claimed.
        _queryFilters := _queryFilters || '
            AND NOT EXISTS (
                SELECT  1
                FROM    ClaimedFoodListing
                WHERE   ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
                  AND   NOT EXISTS (
                            SELECT  1
                            FROM    UnclaimedFoodListing
                            WHERE   UnclaimedFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
                        )
            )
        ';

    ELSE

        -- Get any delivery information so that donor and receiver can see delivery state of Food Listing.
        _queryBase := _queryBase || '
            LEFT JOIN   ClaimedFoodListing  ON  FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
                                            -- Always exclude claimed food listings that have been unclaimed!
                                            AND NOT EXISTS (
                                                SELECT  1
                                                FROM    UnclaimedFoodListing
                                                WHERE   UnclaimedFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
                                            )
        ';

        -- Do we want only the invoking user's claimed food listings and have filter pertaining to specified claimer?
        IF (_myClaimedItemsOnly = TRUE)
        THEN

            _queryFilters := _queryFilters || '
                AND (ClaimedFoodListing.receiverAppUserKey = $6)
            ';

        END IF;

    END IF;
        

    -- Should we match by Donor's regular weekly availability (assumes this is receive tab and given _appUserKey input denoted by $7 is Receiver's)?
    IF (_matchRegularAvailability = TRUE)
    THEN

        _currentWeekday = (SELECT EXTRACT(DOW FROM CURRENT_DATE)); -- Grab [0, 6] index of current day of week (DOW).

        -- This table will be filled with actual timestamps (dates) of availability over the span of the next week relative to today.
        -- These dates are used to determine if the user has an opportunity to receive donated food before it is no longer available.
        -- In other words, it makes their availability schedule comparable to this week's date timestamps.
        DROP TABLE IF EXISTS RelativeAvailabilityDates;
        CREATE TEMP TABLE RelativeAvailabilityDates
        (
            appUserAvailabilityKey  INTEGER     PRIMARY KEY,
            relativeAvailableDate   TIMESTAMP
        );

        INSERT INTO RelativeAvailabilityDates
        SELECT      appUserAvailabilityKey,
                    CURRENT_DATE + INTERVAL '1' day * ((CAST((SELECT EXTRACT(DOW FROM startTime)) AS INTEGER) - _currentWeekday) % 7)
        FROM        AppUserAvailability
        WHERE       appUserKey = _appUserKey;


        _queryBase := _queryBase || '
            INNER JOIN  AppUserAvailability ReceiverAvailability ON ReceiverAvailability.appUserKey = $7
            INNER JOIN  RelativeAvailabilityDates ON ReceiverAvailability.appUserAvailabilityKey = RelativeAvailabilityDates.appUserAvailabilityKey
            INNER JOIN  AppUserAvailability DonorAvailability ON FoodListing.donorAppUserKey = DonorAvailability.appUserKey
        ';

        -- TODO: We may not want to simply find an overlap in time range here!
        --       For example, it may be unrealistic to think that a single overlap of only 1/2 hour is enough to get food from Donor to Receiver!
        _queryFilters := _queryFilters || '
            AND DonorAvailability.startTime < ReceiverAvailability.endTime
            AND DonorAvailability.endTime > ReceiverAvailability.startTime
            AND RelativeAvailabilityDates.relativeAvailableDate <= FoodListing.availableUntilDate
        ';

    END IF;


    -- Determine the grouping mechanism, sort order, offset, and limit.
    _queryGroupAndSort := '
        GROUP BY FoodListing.foodListingKey
        ORDER BY ' ||
        -- Chose the sort order based on the purpose of the search (for receiver tab or cart).
        CASE (_unclaimedOnly)

            WHEN TRUE THEN  -- Receiver tab.
                'FoodListing.availableUntilDate ASC' -- For receiver tab, show donations that will expire eariliest first.

            ELSE  -- Cart.
                CASE (_myClaimedItemsOnly)
                    WHEN TRUE THEN  'MAX(ClaimedFoodListing.claimedDate) DESC'  -- For receiver cart, show most recent claims.
                    ELSE            'FoodListing.donationDate DESC'             -- For donor cart, show most recent donations.
                END

        END || '
        OFFSET $8
        LIMIT $9
    ';


-- ==================================== Dynamic Query Execution Phase ======================================== --
-- =========================================================================================================== --

    --RAISE NOTICE '% % %', _queryBase, _queryFilters, _queryGroupAndSort;

    -- Insert our filtered Food Listing Key - Food Listing Types pairs into our temporary table.
    EXECUTE (_queryBase || _queryFilters || _queryGroupAndSort)
    USING _foodListingKey,
          _foodTypes,
          _needsRefrigeration,
          utcTextToTimestamp(_availableAfterDate),
          CASE (_myDonatedItemsOnly)
            WHEN TRUE THEN _appUserKey
            ELSE NULL 
          END,
          CASE (_myClaimedItemsOnly)
            WHEN TRUE THEN _appUserKey
            ELSE NULL
          END,
          CASE (_matchRegularAvailability)
            WHEN TRUE THEN _appUserKey
            ELSE NULL
          END,
          _retrievalOffset,
          _retrievalAmount;
    

-- ==================================== Final Return Phase ======================================= --
-- =============================================================================================== --

    -- Here we will be doing a select using the filtered food listing keys from the dynamic query above. No grouping will be necessary.
    RETURN QUERY
    SELECT      FoodListing.foodListingKey,

                -- @ts-sql class="FoodListing" file="/shared/food-listing/food-listing.ts"
                JSON_BUILD_OBJECT (
                    'foodListingKey',       FoodListing.foodListingKey,
                    'foodTitle',            FoodListing.foodTitle,
                    -- Concatenates the food types into an array { Type1, Type2, ..., TypeN }
                    'foodTypes',            (
                                                SELECT ARRAY_AGG(FoodListingFoodTypeMap.foodType) AS foodTypes
                                                FROM FoodListingFoodTypeMap
                                                WHERE FoodListingFoodTypeMap.foodListingKey = FoodListing.foodListingKey
                                            ),
                    'needsRefrigeration',   FoodListing.needsRefrigeration,
                    'availableUntilDate',   TO_CHAR(FoodListing.availableUntilDate, 'MM/DD/YYYY'),
                    'foodDescription',      FoodListing.foodDescription,
                    -- Grab all associated image URLs sorted by primary first, then the order that the images were added second.
                    'imgUrls',              ( SELECT * FROM getFoodListingImgUrls(FoodListing.foodListingKey) ),

                    -- App user information of all user's associated with Food Listing (Donor, Receiver(s), & Deliverer(s)).
                    'donorInfo',            ( SELECT sessionData->'appUserInfo' FROM getAppUserSessionData(DonorAppUser.appUserKey) ),
                    -- Form an array of claim information objects here.
                    'claimInfo',            JSON_BUILD_OBJECT (
                                                'receiverInfo',         CASE WHEN (ReceiverAppUser.appUserKey IS NOT NULL)
                                                                            THEN (
                                                                                SELECT sessionData->'appUserInfo'
                                                                                FROM getAppUserSessionData(ReceiverAppUser.appUserKey)
                                                                            )
                                                                            ELSE NULL
                                                                        END,
                                                'delivererInfo',        CASE WHEN (DelivererAppUser.appUserKey IS NOT NULL)
                                                                            THEN (
                                                                                SELECT sessionData->'appUserInfo'
                                                                                FROM getAppUserSessionData(DelivererAppUser.appUserKey)
                                                                            )
                                                                            ELSE NULL
                                                                        END,
                                                'deliveryStateInfo',    JSON_BUILD_OBJECT (
                                                                            'deliveryState',        getDeliveryState (
                                                                                                        DeliveryFoodListing.scheduledStartTime,
                                                                                                        DeliveryFoodListing.startTime,
                                                                                                        DeliveryFoodListing.pickUpTime,
                                                                                                        DeliveryFoodListing.dropOffTime
                                                                                                    ),
                                                                            'scheduledStartTime',   DeliveryFoodListing.scheduledStartTime,
                                                                            'startTime',            DeliveryFoodListing.startTime,
                                                                            'pickUpTime',           DeliveryFoodListing.pickUpTime,
                                                                            'dropOffTime',          DeliveryFoodListing.dropOffTime
                                                                        )
                                            )
                ) AS foodListing
    
    FROM        FiltFoodListing
    INNER JOIN  FoodListing                                             ON  FiltFoodListing.foodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser                         AS DonorAppUser         ON  FoodListing.donorAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo                     AS DonorContact         ON  DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  Organization                    AS DonorOrganization    ON  DonorAppUser.appUserKey = DonorOrganization.appUserKey
    LEFT JOIN   ClaimedFoodListing                                      ON  FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
                                                                        -- Make sure we do not include any unclaimed claims!
                                                                        AND NOT EXISTS (
                                                                                SELECT  1
                                                                                FROM    UnclaimedFoodListing
                                                                                WHERE   UnclaimedFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
                                                                            )
    LEFT JOIN   AppUser                         AS ReceiverAppUser      ON  ClaimedFoodListing.receiverAppUserKey = ReceiverAppUser.appUserKey
    LEFT JOIN   DeliveryFoodListing                                     ON  ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
                                                                        -- Make sure we do not include cancelled deliveries!
                                                                        AND NOT EXISTS (
                                                                                SELECT  1
                                                                                FROM    CancelledDeliveryFoodListing
                                                                                WHERE   CancelledDeliveryFoodListing.deliveryFoodListingKey
                                                                                        = DeliveryFoodListing.deliveryFoodListingKey
                                                                            )
    LEFT JOIN   AppUser                         AS DelivererAppUser     ON  DeliveryFoodListing.delivererAppUserKey = DelivererAppUser.appUserKey
    ORDER BY    FiltFoodListing.orderNumber ASC;

END;
$$ LANGUAGE plpgsql;

-- Test the Stored Procedure here --

SELECT * FROM getFoodListings(1, 0, 10, null, null, null, null, false, true, false, null);
