/**
 * A basic search function for retrieving food listings that meet specific criteria.
 * NOTE: This may need to be further optimized given that it will be dealing with a large amount of rows.
 *       -One idea is to combine the dynamic query and return query and just do the group by in one return query. The query optimizer may come through here.
 */
SELECT dropFunction('getFoodListings');
CREATE OR REPLACE FUNCTION getFoodListings
(
    _appUserKey             AppUser.appUserKey%TYPE,                            -- The App User Key of the current user issuing this query.
    _foodListingKey         FoodListing.foodListingKey%TYPE     DEFAULT NULL,   -- Key identifier of a food listing to be retireved.
    _claimInfoKey           ClaimInfo.claimInfoKey%TYPE         DEFAULT NULL,   -- The key identifier of a claim that is associated with a food listing to retrieved.
    _deliveryInfoKey        DeliveryInfo.deliveryInfoKey%TYPE   DEFAULT NULL,   -- The key identifier of a delivery that is associated with a food listing to retrieve.
    _filters                JSON                                DEFAULT NULL    -- The filters to be applied to query.
)
RETURNS TABLE
(
    foodListingKey  FoodListing.foodListingKey%TYPE,
    foodListing     JSON
)
AS $$
    DECLARE _queryBase          TEXT;
    DECLARE _queryFilters       TEXT;
    DECLARE _queryGroupAndSort  TEXT;
BEGIN

    -- Make sure we do not have a NULL _filters input.
    _filters := COALESCE(_filters, JSON_BUILD_OBJECT());

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
        INNER JOIN  FoodListingFoodTypeMap          ON  FoodListing.foodListingKey = FoodListingFoodTypeMap.foodListingKey
        INNER JOIN  ContactInfo DonorContact        ON  FoodListing.donorAppUserKey = DonorContact.appUserKey
        LEFT JOIN   ClaimInfo                       ON  FoodListing.foodListingKey = ClaimInfo.foodListingKey
                                                    -- Always exclude claimed food listings that have been unclaimed!
                                                    AND NOT EXISTS (
                                                        SELECT  1
                                                        FROM    UnclaimInfo
                                                        WHERE   UnclaimInfo.claimInfoKey = ClaimInfo.claimInfoKey
                                                    )
        ' ||
        CASE WHEN (     (_filters->>'foodListingsStatus') IS NOT NULL
                    AND (_filters->>'foodListingsStatus')::FoodListingsStatus = 'Unclaimed Listings'::FoodListingsStatus )
            THEN 'LEFT JOIN ContactInfo ReceiverContact ON ReceiverContact.appUserKey = $1'
            ELSE 'LEFT JOIN ContactInfo ReceiverContact ON ClaimInfo.receiverAppUserKey = ReceiverContact.appUserKey'
        END || '
        LEFT JOIN   DeliveryInfo                    ON  ClaimInfo.claimInfoKey = DeliveryInfo.claimInfoKey
                                                    AND NOT EXISTS (
                                                        SELECT  1
                                                        FROM    CancelledDeliveryInfo
                                                        WHERE   CancelledDeliveryInfo.deliveryInfoKey = DeliveryInfo.deliveryInfoKey
                                                    )
        ' ||
        CASE WHEN (     (_filters->>'foodListingsStatus') IS NOT NULL
                    AND (_filters->>'foodListingsStatus')::FoodListingsStatus = 'Unscheduled Deliveries'::FoodListingsStatus )
            THEN 'LEFT JOIN ContactInfo DelivererContact ON DelivererContact.appUserKey = $1'
            ELSE 'LEFT JOIN ContactInfo DelivererContact ON DeliveryInfo.delivererAppUserKey = DelivererContact.appUserKey'
        END || '
    ';

    _queryFilters := '
        WHERE ($2 IS NULL                                   OR FoodListing.foodListingKey = $2)
          AND ($3 IS NULL                                   OR ClaimInfo.claimInfoKey = $3)
          AND ($4 IS NULL                                   OR DeliveryInfo.deliveryInfoKey = $4)
          -- We will translate the list of food type descriptions into integer keys for lookup efficiency.
          AND (($5->>''foodTypes'') IS NULL                 OR FoodListingFoodTypeMap.foodType = ANY(jsonArrToPostgresTextArr($5->''foodTypes'')::FoodType[]))
          AND (($5->>''needsRefrigeration'') IS NULL        OR FoodListing.needsRefrigeration = ($5->>''needsRefrigeration'')::BOOLEAN)
          AND (($5->>''availableAfterDate'') IS NULL        OR FoodListing.availableUntilDate >= utcTextToTimestamp(($5->>''availableAfterDate'')::TEXT))
          AND (($5->>''maxEstimatedWeight'') IS NULL        OR FoodListing.estimatedWeight <= ($5->>''maxEstimatedWeight'')::INTEGER)
          AND (($5->>''recommendedVehicleType'') IS NULL    OR FoodListing.recommendedVehicleType = ($5->>''recommendedVehicleType'')::VehicleType)
          AND (($5->>''deliveryState'') IS NULL             OR 
            (
                ($5->>''deliveryState'')::DeliveryState = getDeliveryState( DeliveryInfo.scheduledStartTime,
                                                                            DeliveryInfo.startTime,
                                                                            DeliveryInfo.pickUpTime,
                                                                            DeliveryInfo.dropOffTime)
            ))
          AND (($5->>''foodListingsStatus'') IS NULL        OR
            (
                    (($5->>''foodListingsStatus'')::FoodListingsStatus <> ''Unclaimed Listings''::FoodListingsStatus        OR ClaimInfo.claimInfoKey IS NULL)
                AND (($5->>''foodListingsStatus'')::FoodListingsStatus <> ''My Donated Listings''::FoodListingsStatus       OR FoodListing.donorAppUserKey = $1)
                AND (($5->>''foodListingsStatus'')::FoodListingsStatus <> ''My Claimed Listings''::FoodListingsStatus       OR ClaimInfo.receiverAppUserKey = $1)
                AND (($5->>''foodListingsStatus'')::FoodListingsStatus <> ''Unscheduled Deliveries''::FoodListingsStatus    OR
                        (
                                ClaimInfo.claimInfoKey IS NOT NULL
                            AND DeliveryInfo.scheduledStartTime IS NULL
                        ))
                AND (($5->>''foodListingsStatus'')::FoodListingsStatus <> ''My Scheduled Deliveries''::FoodListingsStatus   OR DeliveryInfo.delivererAppUserKey = $1)
            ))
          -- Ensure that food listing has not been removed.
          -- NOTE: Transofrming this into a left join combined with an IS NULL where clause check may be more efficient!!!
          AND NOT EXISTS (
              SELECT    1
              FROM      RemovedFoodListing
              WHERE     RemovedFoodListing.foodListingKey = FoodListing.foodListingKey
          )
    ';


    IF ((_filters->>'maxDistance') IS NOT NULL)
    THEN

        _queryFilters := _queryFilters || '
            AND ST_DWITHIN (
                    ReceiverContact.gpsCoordinate,
                    DonorContact.gpsCoordinate,
                    CEIL(($5->>''maxDistance'')::INTEGER * 1609.34)
                )
        ';

        IF ((_filters->>'foodListingsStatus') IS NOT NULL AND (_filters->>'foodListingsStatus')::FoodListingsStatus = 'Unscheduled Deliveries'::FoodListingsStatus)
        THEN

            _queryFilters := _queryFilters || '
                AND ST_DWITHIN (
                        DelivererContact.gpsCoordinate,
                        DonorContact.gpsCoordinate,
                        CEIL(($5->>''maxDistance'')::INTEGER * 1609.34)
                    )
                AND ST_DWITHIN (
                        DelivererContact.gpsCoordinate,
                        ReceiverContact.gpsCoordinate,
                        CEIL(($5->>''maxDistance'')::INTEGER * 1609.34)
                    )
            ';

        END IF;

    END IF;
        

    -- Should we match by user's regular weekly availability?
    IF ((_filters->>'matchRegularAvailability')::BOOLEAN OR (_filters->>'matchAvailableNow')::BOOLEAN)
    THEN

        
        _queryBase := _queryBase ||
        CASE WHEN (     (_filters->>'foodListingsStatus') IS NOT NULL
                   AND  (_filters->>'foodListingsStatus')::FoodListingsStatus = 'Unscheduled Deliveries'::FoodListingsStatus)
            THEN '
                INNER JOIN  AppUserAvailability DelivererAvailability   ON DelivererAvailability.appUserKey = $1
                INNER JOIN  AppUserAvailability DonorAvailability       ON FoodListing.donorAppUserKey = DonorAvailability.appUserKey
                INNER JOIN  AppUserAvailability ReceiverAvailability    ON ClaimInfo.receiverAppUserKey = ReceiverAvailability.appUserKey
            '
            ELSE '
                INNER JOIN  AppUserAvailability DonorAvailability       ON FoodListing.donorAppUserKey = DonorAvailability.appUserKey
                INNER JOIN  AppUserAvailability ReceiverAvailability    ON ReceiverAvailability.appUserKey = $1
            '
        END;

        _queryFilters := _queryFilters ||   genAvailabilityOverlapFilters (
                                                (_filters->>'maxDistance')::INTEGER,
                                                (    (_filters->>'foodListingsStatus') IS NOT NULL
                                                 AND (_filters->>'foodListingsStatus')::FoodListingsStatus = 'Unscheduled Deliveries'::FoodListingsStatus),
                                                (_filters->>'matchRegularAvailability')::BOOLEAN,
                                                (_filters->>'matchAvailableNow')::BOOLEAN
                                            );

    END IF;


    -- Determine the grouping mechanism, sort order, offset, and limit.
    _queryGroupAndSort := '
        GROUP BY FoodListing.foodListingKey
        ORDER BY ' ||
        -- Chose the sort order based on the purpose of the search (for receiver tab or cart).
        CASE ((_filters->>'foodListingsStatus')::FoodListingsStatus)

            WHEN 'Unclaimed Listings'::FoodListingsStatus THEN  -- Receiver tab.
                'FoodListing.availableUntilDate ASC' -- For receiver tab, show donations that will expire eariliest first.

            ELSE  -- Cart.
                CASE ((_filters->>'foodListingsStatus')::FoodListingsStatus)
                    WHEN 'My Claimed Listings'::FoodListingsStatus THEN 'MAX(ClaimInfo.claimedDate) DESC'   -- For receiver cart, show most recent claims.
                    ELSE                                                'FoodListing.donationDate DESC'     -- For donor cart, show most recent donations.
                END

        END || '
            OFFSET CASE WHEN (($5->>''retrievalOffset'') IS NOT NULL)
                THEN ($5->>''retrievalOffset'')::INTEGER
                ELSE 0
            END
            LIMIT CASE WHEN (($5->''retrievalAmount'') IS NOT NULL)
                THEN ($5->>''retrievalAmount'')::INTEGER
                ELSE 1000
            END
        ';


-- ==================================== Dynamic Query Execution Phase ======================================== --
-- =========================================================================================================== --

    RAISE NOTICE '% % %', _queryBase, _queryFilters, _queryGroupAndSort;

    -- Insert our filtered Food Listing Key - Food Listing Types pairs into our temporary table.
    EXECUTE (_queryBase || _queryFilters || _queryGroupAndSort)
    USING   _appUserKey,
            _foodListingKey,
            _claimInfoKey,
            _deliveryInfoKey,
            _filters;
    

-- ==================================== Final Return Phase ======================================= --
-- =============================================================================================== --

    -- Here we will be doing a select using the filtered food listing keys from the dynamic query above. No grouping will be necessary.
    RETURN QUERY
    SELECT  FoodListing.foodListingKey,

            -- @ts-sql class="FoodListing" file="/shared/food-listing/food-listing.ts"
            JSON_BUILD_OBJECT (
                
                'foodListingKey',           FoodListing.foodListingKey,
                'foodTitle',                FoodListing.foodTitle,
                -- Concatenates the food types into an array { Type1, Type2, ..., TypeN }
                'foodTypes',                (
                                                SELECT ARRAY_AGG(FoodListingFoodTypeMap.foodType) AS foodTypes
                                                FROM FoodListingFoodTypeMap
                                                WHERE FoodListingFoodTypeMap.foodListingKey = FoodListing.foodListingKey
                                            ),
                'needsRefrigeration',       FoodListing.needsRefrigeration,
                'availableUntilDate',       timestampToUtcText(FoodListing.availableUntilDate),
                'estimatedWeight',          FoodListing.estimatedWeight,
                'estimatedValue',           FoodListing.estimatedValue,
                'recommendedVehicleType',   FoodListing.recommendedVehicleType,
                'foodDescription',          FoodListing.foodDescription,
                -- Grab all associated image URLs sorted by primary first, then the order that the images were added second.
                'imgUrls',                  ( SELECT * FROM getFoodListingImgUrls(FoodListing.foodListingKey) ),

                -- App user information of all user's associated with Food Listing (Donor, Receiver(s), & Deliverer(s)).
                'donorInfo',                ( SELECT sessionData->'appUser' FROM getAppUserSessionData(DonorAppUser.appUserKey) ),
                -- Form an array of claim information objects here.
                'claimInfo',                JSON_BUILD_OBJECT (
                    
                    'claimInfoKey',             ClaimInfo.claimInfoKey,
                    'receiverInfo',             CASE WHEN (ReceiverAppUser.appUserKey IS NOT NULL)
                                                    THEN (
                                                        SELECT sessionData->'appUser'
                                                        FROM getAppUserSessionData(ReceiverAppUser.appUserKey)
                                                    )
                                                    ELSE NULL
                                                END,
                    -- This large subquery in getPossibleDeliveryTimes may need to be inlined for performance benefits. Although, the select portion of this (outter) query
                    -- should be evaluated last, and therefore, this should only happen a very limited number of times... so it's probably fine.
                    'possibleDeliveryTimes',    (   
                                                    SELECT  ARRAY_AGG(getPossibleDeliveryTimes)
                                                    FROM    getPossibleDeliveryTimes(ClaimInfo.claimInfoKey, _appUserKey)
                                                ),
                    'deliveryInfo',             JSON_BUILD_OBJECT (

                        'deliveryInfoKey',      DeliveryInfo.deliveryInfoKey,
                        'delivererInfo',        CASE WHEN (DelivererAppUser.appUserKey IS NOT NULL)
                                                    THEN (
                                                        SELECT sessionData->'appUser'
                                                        FROM getAppUserSessionData(DelivererAppUser.appUserKey)
                                                    )
                                                    ELSE NULL
                                                END,
                        'deliveryStateInfo',    JSON_BUILD_OBJECT (
                                                    'deliveryState',        getDeliveryState (
                                                                                DeliveryInfo.scheduledStartTime,
                                                                                    DeliveryInfo.startTime,
                                                                                DeliveryInfo.pickUpTime,
                                                                                DeliveryInfo.dropOffTime
                                                                            ),
                                                    'scheduledStartTime',   DeliveryInfo.scheduledStartTime,
                                                    'startTime',            DeliveryInfo.startTime,
                                                    'pickUpTime',           DeliveryInfo.pickUpTime,
                                                    'dropOffTime',          DeliveryInfo.dropOffTime
                                                )
                    )
                )
            ) AS foodListing
    
    FROM        FiltFoodListing
    INNER JOIN  FoodListing                                 ON  FiltFoodListing.foodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser             AS DonorAppUser         ON  FoodListing.donorAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo         AS DonorContact         ON  DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  Organization        AS DonorOrganization    ON  DonorAppUser.appUserKey = DonorOrganization.appUserKey
    LEFT JOIN   ClaimInfo                                   ON  FoodListing.foodListingKey = ClaimInfo.foodListingKey
                                                            -- Make sure we do not include any unclaimed claims!
                                                            AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM    UnclaimInfo
                                                                    WHERE   UnclaimInfo.claimInfoKey = ClaimInfo.claimInfoKey
                                                                )
    LEFT JOIN   AppUser             AS ReceiverAppUser      ON  ClaimInfo.receiverAppUserKey = ReceiverAppUser.appUserKey
    LEFT JOIN   DeliveryInfo                                ON  ClaimInfo.claimInfoKey = DeliveryInfo.claimInfoKey
                                                            -- Make sure we do not include cancelled deliveries!
                                                            AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM    CancelledDeliveryInfo
                                                                    WHERE   CancelledDeliveryInfo.deliveryInfoKey = DeliveryInfo.deliveryInfoKey
                                                                )
    LEFT JOIN   AppUser             AS DelivererAppUser     ON  DeliveryInfo.delivererAppUserKey = DelivererAppUser.appUserKey
    ORDER BY    FiltFoodListing.orderNumber ASC;

END;
$$ LANGUAGE plpgsql;


-- Test the Stored Procedure here --
SELECT * FROM getFoodListings(1, NULL, NULL, NULL, JSON_BUILD_OBJECT (
    'maxDistance',              10,
    'maxEstimatedWeight',       null,
    'recommendedVehicleType',   null,
    'matchRegularAvailability', false,
    'matchAvailableNow',        true,
    'foodListingsStatus',       'Unscheduled Deliveries',
    'retrievalAmount',          10,
    'retrievalOffset',          0,
    'foodTypes',                null,
    'needsRefrigeration',       null
));
