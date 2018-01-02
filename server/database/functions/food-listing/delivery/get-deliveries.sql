/**
 * Gets Deliveries (DeliveryFoodListings + ClaimedFoodListings + FoodListings) based off of filter criteria.
 */
SELECT dropFunction('getDeliveries');
CREATE OR REPLACE FUNCTION getDeliveries
(
    _appUserKey             AppUser.appUserKey%TYPE,                                        -- The key identifier of the logged in user (deliverer).
    _retrievalOffset        INTEGER,                                                        -- The offset location where we will start retrieving results (beginning of range of results).
    _retrievalAmount        INTEGER,                                                        -- The amount of results that we will retrieve (_retrievalOffset + _retrievalAmount is end of range).
    _deliveryFoodListingKey DeliveryFoodListing.deliveryFoodListingKey%TYPE DEFAULT NULL,   -- The key identifier of a delivery food listing.
    _claimedFoodListingKey  ClaimedFoodListing.claimedFoodListingKey%TYPE   DEFAULT NULL,   -- The key identifier of a claimed food listing that is to be or has been delivered.
    _maxDistance            INTEGER                                         DEFAULT NULL,   -- The maximum distance (mi) of Donors and Reivers from the (potential) deliverer.
    _maxTotalWeight         FoodListing.totalWeight%TYPE                    DEFAULT NULL,   -- The maximum total weight of the delivery.
    _unscheduledDeliveries  BOOLEAN                                         DEFAULT FALSE,  -- Set to TRUE if we should only pull back deliveries that have not been scheduled.
    _myScheduledDeliveries  BOOLEAN                                         DEFAULT FALSE,  -- Set to TRUE if we should only pull back deliveries that are scheduled for deliverer.
    _matchAvailability      BOOLEAN                                         DEFAULT TRUE,   -- If TRUE, matches the availability of the Driver with that of the Receiver and Donor.
                                                                                            -- When set FALSE, only grabs Deliveries that are available to start immediately.
    _deliveryState          DeliveryState                                   DEFAULT NULL    -- If set, then only pull back deliveries in given state.
)
RETURNS TABLE
(
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    delivery                JSON
)
AS $$
    DECLARE _availableNow                   BOOLEAN     DEFAULT FALSE;
    DECLARE _maxDistanceMeters              INTEGER     DEFAULT NULL;
    DECLARE _nowRelativeToAvailabilityTimes TIMESTAMP;
BEGIN

    -- Calculate the max distance in meters if provided as argument (in miles).
    IF (_maxDistance IS NOT NULL)
    THEN
        _maxDistanceMeters := (_maxDistance * 1609.34); -- 1609.34 meters/mile
    END IF;


    -- If NULL is passed in for following inputs, then set them to FALSE for consistency.
    IF (_unscheduledDeliveries IS NULL)
    THEN
        _unscheduledDeliveries := FALSE;
    END IF;

    IF (_myScheduledDeliveries IS NULL)
    THEN
        _myScheduledDeliveries := FALSE;
    END IF;

    IF (_matchAvailability IS NULL)
    THEN
        _matchAvailability := FALSE;
    END IF;


    -- Determine if we should only pull back Deliveries that are available to start now.
    IF (_matchAvailability <> TRUE AND _myScheduledDeliveries <> TRUE) THEN
        
        _availableNow := TRUE;

        -- Get current time, but relative to App User Availability timestamps.
        _nowRelativeToAvailabilityTimes := convertToAvailabilityTime(CURRENT_TIMESTAMP::TIMESTAMP);

    END IF;
    

    -- TODO: Measure performance of this query! If optimizer doesn't come through here, we can select multiple results in temp table with dynamic queries above!!!
    --       Specifically worried about impact of DISTINCT ON part of clause, although it shouldn't be a big performance penalty!
    RETURN QUERY
    SELECT DISTINCT ON (ClaimedFoodListing.claimedFoodListingKey)
            ClaimedFoodListing.claimedFoodListingKey,
            DeliveryFoodListing.deliveryFoodListingKey,
            -- @ts-sql class="DeliveryFoodListing" file="/shared/food-listings/delivery-food-listing.ts"
            JSON_BUILD_OBJECT (
                'claimedFoodListingKey',    ClaimedFoodListing.claimedFoodListingKey,
                'deliveryFoodListingKey',   DeliveryFoodListing.deliveryFoodListingKey,
                'deliveryStateInfo',        JSON_BUILD_OBJECT (
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
                                            ),
                'foodTitle',                FoodListing.foodTitle,
                -- NOTE: We may want to remove these getAppUserSessionData() function calls for performance improvements! They create subqueries (likely inlined though).
                'donorInfo',                (SELECT sessionData->'appUserInfo' FROM getAppUserSessionData(DonorAppUser.appUserKey)),
                'receiverInfo',             (SELECT sessionData->'appUserInfo' FROM getAppUserSessionData(ReceiverAppUser.appUserKey)),
                'foodDescription',          FoodListing.foodDescription,
                'perishable',               FoodListing.perishable,
                'availableUntilDate',       FoodListing.availableUntilDate,
                'claimedUnitsCount',        ClaimedFoodListing.claimedUnitsCount,
                'unitsLabel',               FoodListing.unitsLabel,
                'imgUrl',                   FoodListing.imgUrl,
                'totalWeight',              FoodListing.totalWeight,
                -- This large subquery in getPossibleDeliveryTimes may need to be inlined for performance benefits. Although, the select portion of this query
                -- should be evaluated last, and therefore, this should only happen a very limited number of times... so it's probably fine.
                'possibleDeliveryTimes',    (   
                                                SELECT  ARRAY_AGG(getPossibleDeliveryTimes)
                                                FROM    getPossibleDeliveryTimes(ClaimedFoodListing.claimedFoodListingKey, _appUserKey)
                                            )
            ) AS delivery
    FROM        FoodListing
    INNER JOIN  ClaimedFoodListing                              ON  FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
                                                                -- Do not include claims that have been completely unclaimed (0 remaining claimed units).
                                                                AND ClaimedFoodListing.claimedUnitsCount <> 0
                                                                -- Do not include rejected cancelled deliveries!
                                                                AND NOT EXISTS (
                                                                    SELECT      1
                                                                    FROM        CancelledDeliveryFoodListing
                                                                    INNER JOIN  DeliveryFoodListing ON CancelledDeliveryFoodListing.deliveryFoodListingKey =
                                                                                                       DeliveryFoodListing.deliveryFoodListingKey
                                                                    WHERE       DeliveryFoodListing.claimedFoodListingKey = ClaimedFoodListing.claimedFoodListingKey
                                                                      AND       CancelledDeliveryFoodListing.foodRejected = TRUE
                                                                )
    INNER JOIN  AppUser             AS DelivererAppUser         ON  _appUserKey = DelivererAppUser.appUserKey
    INNER JOIN  AppUserAvailability AS DelivererAvailability    ON  DelivererAppUser.appUserKey = DelivererAvailability.appUserKey
    INNER JOIN  AppUser             AS DonorAppUser             ON  FoodListing.donatedByAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo         AS DonorContact             ON  DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  AppUserAvailability AS DonorAvailability        ON  DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUser             AS ReceiverAppUser          ON  ClaimedFoodListing.claimedByAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  ContactInfo         AS ReceiverContact          ON  ReceiverAppUser.appUserKey = ReceiverContact.appUserKey
    INNER JOIN  AppUserAvailability AS ReceiverAvailability     ON  ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    -- LEFT b/c we may or may not have a delivery lined up yet (deliverer may be looking for potential deliveries here).
    LEFT JOIN   DeliveryFoodListing                             ON  ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
                                                                -- Exclude Delivery Food Listings that have been cancelled!
                                                                AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM    CancelledDeliveryFoodListing
                                                                    WHERE   DeliveryFoodListing.deliveryFoodListingKey = CancelledDeliveryFoodListing.deliveryFoodListingKey
                                                                )
    WHERE       (_deliveryFoodListingKey IS NULL    OR DeliveryFoodListing.deliveryFoodListingKey = _deliveryFoodListingKey)
      AND       (_claimedFoodListingKey IS NULL     OR ClaimedFoodListing.claimedFoodListingKey = _claimedFoodListingKey)
      AND       (_maxDistanceMeters IS NULL         OR ST_DWITHIN(ReceiverContact.gpsCoordinate, DonorContact.gpsCoordinate, _maxDistanceMeters))
      AND       (_maxTotalWeight IS NULL            OR FoodListing.totalWeight <= _maxTotalWeight)
      AND       (_myScheduledDeliveries = FALSE     OR DeliveryFoodListing.deliveryAppUserKey = _appUserKey)
      AND       (_unscheduledDeliveries = FALSE     OR DeliveryFoodListing.scheduledStartTime IS NULL)
      -- When deliverer, receiver, and donor availabilities must all line up for future scheduling of delivery.
      AND       (_matchAvailability = FALSE         OR (    ReceiverAvailability.endTime > DelivererAvailability.startTime
                                                        AND ReceiverAvailability.startTime < DelivererAvailability.endTime
                                                        AND DonorAvailability.endTime > DelivererAvailability.startTime
                                                        AND DonorAvailability.startTime < DelivererAvailability.endTime))
      -- When receiver and donor are both available now to handle delivery.
      AND       (_availableNow = FALSE              OR (    ReceiverAvailability.endTime > _nowRelativeToAvailabilityTimes
                                                        AND ReceiverAvailability.startTime < _nowRelativeToAvailabilityTimes
                                                        AND DonorAvailability.endTime > _nowRelativeToAvailabilityTimes
                                                        AND DonorAvailability.startTime < _nowRelativeToAvailabilityTimes))
      -- Apply delivery state filters
      AND       (_deliveryState IS NULL             OR _deliveryState = (SELECT * FROM getDeliveryState(DeliveryFoodListing.scheduledStartTime,
                                                                                                        DeliveryFoodListing.startTime,
                                                                                                        DeliveryFoodListing.pickUpTime,
                                                                                                        DeliveryFoodListing.dropOffTime)))
      -- By default, don't include dropped off (completed) deliveries unless explicit delivery state filter selected!
      AND       (_deliveryState IS NOT NULL         OR DeliveryFoodListing.dropOffTime IS NULL)
    ORDER BY    ClaimedFoodListing.claimedFoodListingKey,
                -- Sort by relavent Delivery State filter.
                CASE WHEN _deliveryState IS NULL        THEN DeliveryFoodListing.scheduledStartTime END ASC,
                CASE WHEN _deliveryState = 'started'    THEN DeliveryFoodListing.startTime END ASC,
                CASE WHEN _deliveryState = 'pickedUp'   THEN DeliveryFoodListing.pickUpTime END ASC,
                CASE WHEN _deliveryState = 'droppedOff' THEN DeliveryFoodListing.dropOffTime END DESC -- DESC for most recently completed.
    OFFSET      _retrievalOffset
    LIMIT       _retrievalAmount;

END;
$$ LANGUAGE plpgsql;


SELECT * FROM getDeliveries(1, 0, 10);
