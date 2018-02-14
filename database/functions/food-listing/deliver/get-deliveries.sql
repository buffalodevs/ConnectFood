/**
 * Gets Deliveries (DeliveryInfos + ClaimInfos + FoodListings) based off of filter criteria.
 */
SELECT dropFunction('getDeliveries');
CREATE OR REPLACE FUNCTION getDeliveries
(
    _appUserKey             AppUser.appUserKey%TYPE,                            -- The key identifier of the logged in user (deliverer).
    _retrievalOffset        INTEGER,                                            -- The offset location where we will start retrieving results (beginning of range of results).
    _retrievalAmount        INTEGER,                                            -- The amount of results that we will retrieve (_retrievalOffset + _retrievalAmount is end of range).
    _deliveryInfoKey        DeliveryInfo.deliveryInfoKey%TYPE   DEFAULT NULL,   -- The key identifier of a delivery food listing.
    _claimInfoKey           ClaimInfo.claimInfoKey%TYPE         DEFAULT NULL,   -- The key identifier of a claimed food listing that is to be or has been delivered.
    _maxDistance            INTEGER                             DEFAULT NULL,   -- The maximum distance (mi) of Donors and Reivers from the (potential) deliverer.
    _maxEstimatedWeight     FoodListing.estimatedWeight%TYPE    DEFAULT NULL,   -- The maximum estimated weight of the delivery.
    _unscheduledDeliveries  BOOLEAN                             DEFAULT FALSE,  -- Set to TRUE if we should only pull back deliveries that have not been scheduled.
    _myScheduledDeliveries  BOOLEAN                             DEFAULT FALSE,  -- Set to TRUE if we should only pull back deliveries that are scheduled for deliverer.
    _matchAvailability      BOOLEAN                             DEFAULT TRUE,   -- If TRUE, matches the availability of the Driver with that of the Receiver and Donor.
                                                                                -- When set FALSE, only grabs Deliveries that are available to start immediately.
    _deliveryState          DeliveryState                       DEFAULT NULL,   -- If set, then only pull back deliveries in given state.
    _recommendedVehicleType VehicleType                         DEFAULT NULL    -- If set, then only pull back deliveries with recommended vehicle type size equal or smaller.
)
RETURNS TABLE
(
    claimInfoKey        ClaimInfo.claimInfoKey%TYPE,
    deliveryInfoKey     DeliveryInfo.deliveryInfoKey%TYPE,
    delivery            JSON
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
    SELECT DISTINCT ON (ClaimInfo.claimInfoKey)
            ClaimInfo.claimInfoKey,
            DeliveryInfo.deliveryInfoKey,
            -- @ts-sql class="DeliveryInfo" file="/shared/food-listings/delivery-food-listing.ts"
            JSON_BUILD_OBJECT (
                'claimInfoKey',    ClaimInfo.claimInfoKey,
                'deliveryInfoKey',   DeliveryInfo.deliveryInfoKey,
                'deliveryStateInfo',        JSON_BUILD_OBJECT (
                                                'deliveryState',        getDeliveryState (
                                                                            DeliveryInfo.scheduledStartTime,
                                                                            DeliveryInfo.startTime,
                                                                            DeliveryInfo.pickUpTime,
                                                                            DeliveryInfo.dropOffTime
                                                                        ),
                                                'scheduledStartTime',   timestampToUtcText(DeliveryInfo.scheduledStartTime),
                                                'startTime',            timestampToUtcText(DeliveryInfo.startTime),
                                                'pickUpTime',           timestampToUtcText(DeliveryInfo.pickUpTime),
                                                'dropOffTime',          timestampToUtcText(DeliveryInfo.dropOffTime)
                                            ),
                'foodTitle',                FoodListing.foodTitle,
                -- NOTE: We may want to remove these getAppUserSessionData() function calls for performance improvements! They create subqueries (likely inlined though).
                'donorInfo',                ( SELECT sessionData->'appUser' FROM getAppUserSessionData(DonorAppUser.appUserKey) ),
                'receiverInfo',             ( SELECT sessionData->'appUser' FROM getAppUserSessionData(ReceiverAppUser.appUserKey) ),
                'foodDescription',          FoodListing.foodDescription,
                'needsRefrigeration',       FoodListing.needsRefrigeration,
                'availableUntilDate',       FoodListing.availableUntilDate,
                'imgUrls',                  ( SELECT * FROM getFoodListingImgUrls(FoodListing.foodListingKey) ),
                'estimatedWeight',          FoodListing.estimatedWeight,
                -- This large subquery in getPossibleDeliveryTimes may need to be inlined for performance benefits. Although, the select portion of this query
                -- should be evaluated last, and therefore, this should only happen a very limited number of times... so it's probably fine.
                'possibleDeliveryTimes',    (   
                                                SELECT  ARRAY_AGG(getPossibleDeliveryTimes)
                                                FROM    getPossibleDeliveryTimes(ClaimInfo.claimInfoKey, _appUserKey)
                                            )
            ) AS delivery
    FROM        FoodListing
    INNER JOIN  ClaimInfo                              ON  FoodListing.foodListingKey = ClaimInfo.foodListingKey
                                                                -- Do not include claims that have been unclaimed or that were unscheduled and marked as rejected.
                                                                AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM        UnclaimInfo
                                                                    WHERE       UnclaimInfo.claimInfoKey = ClaimInfo.claimInfoKey
                                                                )
    INNER JOIN  AppUser             AS DelivererAppUser         ON  _appUserKey = DelivererAppUser.appUserKey
    INNER JOIN  AppUserAvailability AS DelivererAvailability    ON  DelivererAppUser.appUserKey = DelivererAvailability.appUserKey
    INNER JOIN  AppUser             AS DonorAppUser             ON  FoodListing.donorAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo         AS DonorContact             ON  DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  AppUserAvailability AS DonorAvailability        ON  DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUser             AS ReceiverAppUser          ON  ClaimInfo.receiverAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  ContactInfo         AS ReceiverContact          ON  ReceiverAppUser.appUserKey = ReceiverContact.appUserKey
    INNER JOIN  AppUserAvailability AS ReceiverAvailability     ON  ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    -- LEFT b/c we may or may not have a delivery lined up yet (deliverer may be looking for potential deliveries here).
    LEFT JOIN   DeliveryInfo                             ON  ClaimInfo.claimInfoKey = DeliveryInfo.claimInfoKey
                                                                -- Exclude Delivery Food Listings that have been cancelled!
                                                                AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM    CancelledDeliveryInfo
                                                                    WHERE   CancelledDeliveryInfo.deliveryInfoKey = DeliveryInfo.deliveryInfoKey
                                                                )
                -- Ensure that the base Food Listing has not been marked as removed.
                -- NOTE: Using a left join to RemovedFoodListing combined with IS NULL where clause check may be more efficient!
    WHERE       NOT EXISTS (
                    SELECT  1
                    FROM    RemovedFoodListing
                    WHERE   RemovedFoodListing.foodListingKey = FoodListing.foodListingKey
                )
      AND       (_deliveryInfoKey IS NULL    OR DeliveryInfo.deliveryInfoKey = _deliveryInfoKey)
      AND       (_claimInfoKey IS NULL     OR ClaimInfo.claimInfoKey = _claimInfoKey)
      AND       (_maxDistanceMeters IS NULL         OR ST_DWITHIN(ReceiverContact.gpsCoordinate, DonorContact.gpsCoordinate, _maxDistanceMeters))
      AND       (_maxEstimatedWeight IS NULL        OR FoodListing.estimatedWeight <= _maxEstimatedWeight)
      AND       (_myScheduledDeliveries = FALSE     OR DeliveryInfo.delivererAppUserKey = _appUserKey)
      AND       (_unscheduledDeliveries = FALSE     OR DeliveryInfo.scheduledStartTime IS NULL)
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
      AND       (_deliveryState IS NULL             OR _deliveryState = (SELECT * FROM getDeliveryState(DeliveryInfo.scheduledStartTime,
                                                                                                        DeliveryInfo.startTime,
                                                                                                        DeliveryInfo.pickUpTime,
                                                                                                        DeliveryInfo.dropOffTime)))
      -- By default, don't include dropped off (completed) deliveries unless explicit delivery state filter selected!
      AND       (_deliveryState IS NOT NULL         OR DeliveryInfo.dropOffTime IS NULL)
      AND       (_recommendedVehicleType IS NULL    OR FoodListing.recommendedVehicleType <= _recommendedVehicleType)
    ORDER BY    ClaimInfo.claimInfoKey,
                -- Sort by relavent Delivery State filter.
                CASE WHEN _deliveryState IS NULL        THEN DeliveryInfo.scheduledStartTime END ASC,
                CASE WHEN _deliveryState = 'started'    THEN DeliveryInfo.startTime END ASC,
                CASE WHEN _deliveryState = 'pickedUp'   THEN DeliveryInfo.pickUpTime END ASC,
                CASE WHEN _deliveryState = 'droppedOff' THEN DeliveryInfo.dropOffTime END DESC -- DESC for most recently completed.
    OFFSET      _retrievalOffset
    LIMIT       _retrievalAmount;

END;
$$ LANGUAGE plpgsql;
