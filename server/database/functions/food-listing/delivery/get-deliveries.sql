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
    _matchAvailability      BOOLEAN                                         DEFAULT FALSE,  -- Matches the availability of the Driver with that of the Receiver and Donor.
    _availableNow           BOOLEAN                                         DEFAULT FALSE   -- Disregards Driver availability and finds Donors and Receivers that are available now.
)
RETURNS TABLE
(
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    deliveryFoodListing     JSON
)
AS $$
    DECLARE _maxDistanceMeters  INTEGER     DEFAULT NULL;
    DECLARE _currentTimestamp   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP; -- Only evaluate current time once and store it for efficiency.
BEGIN

    -- Calculate the max distance in meters if provided as argument (in miles).
    IF (_maxDistance IS NOT NULL)
    THEN
        _maxDistanceMeters := (_maxDistance * 1609.34); -- 1609.34 meters/mile
    END IF;


    -- If NULL is passed in for following inputs, then set them to FALSE for consistency.
    IF (_myScheduledDeliveries IS NULL)
    THEN
        _myScheduledDeliveries := FALSE;
    END IF;

    IF (_matchAvailability IS NULL)
    THEN
        _matchAvailability := FALSE;
    END IF;

    IF (_availableNow IS NULL)
    THEN
        _availableNow := FALSE;
    END IF;

    
    -- If we are finding potential deliveries that are available now to be delivered, then we will not try to match against Deliverer Availability!
    IF (_matchAvailability = TRUE AND _availableNow = TRUE)
    THEN
        _matchAvailability := FALSE;
    END IF;
    

    -- TODO: Measure performance of this query! If optimizer doesn't come through here, we can select multiple results in temp table with dynamic queries above!!!
    -- Perform final return query using filters.
    RETURN QUERY
    SELECT DISTINCT ON (ClaimedFoodListing.claimedFoodListingKey)
            ClaimedFoodListing.claimedFoodListingKey,
            DeliveryFoodListing.deliveryFoodListingKey,
            -- @ts-sql class="DeliveryFoodListing" file="/shared/food-listings/delivery-food-listing.ts"
            JSON_BUILD_OBJECT (
                'claimedFoodListingKey',    ClaimedFoodListing.claimedFoodListingKey,
                'deliveryFoodListingKey',   DeliveryFoodListing.deliveryFoodListingKey,
                'deliveryState',            (
                                                SELECT getDeliveryState (
                                                    DeliveryFoodListing.scheduledStartTime,
                                                    DeliveryFoodListing.startTime,
                                                    DeliveryFoodListing.pickUpTime,
                                                    DeliveryFoodListing.dropOffTime
                                                )
                                            ),
                'foodTitle',                FoodListing.foodTitle,
                -- @ts-sql class="FoodListingUser" file="/shared/food-listings/food-listing.ts"
                'donorInfo',                JSON_BUILD_OBJECT (
                                                'organizationName', DonorOrganization.name,
                                                'address',          DonorContact.address,
                                                'city',             DonorContact.city,
                                                'state',            DonorContact.state,
                                                'zip',              DonorContact.zip,
                                                -- @ts-sql class="GPSCoordinate" file="/shared/common-util/geocode.ts"
                                                'gpsCoordinate',    JSON_BUILD_OBJECT (
                                                                        'latitude',     ST_Y(DonorContact.gpsCoordinate::GEOMETRY),
                                                                        'longitude',    ST_X(DonorContact.gpsCoordinate::GEOMETRY)    
                                                                    ),
                                                'phone',            DonorContact.phone,
                                                'email',            DonorAppUser.email,
                                                'lastName',         DonorAppUser.lastName,
                                                'firstName',        DonorAppUser.firstName
                                            ),
                -- @ts-sql class="FoodListingUser" file="/shared/food-listings/food-listing.ts"
                'receiverInfo',             JSON_BUILD_OBJECT (
                                                'organizationName', ReceiverOrganization.name,
                                                'address',          ReceiverContact.address,
                                                'city',             ReceiverContact.city,
                                                'state',            ReceiverContact.state,
                                                'zip',              ReceiverContact.zip,
                                                -- @ts-sql class="GPSCoordinate" file="/shared/common-util/geocode.ts"
                                                'gpsCoordinate',    JSON_BUILD_OBJECT (
                                                                        'latitude',     ST_Y(ReceiverContact.gpsCoordinate::GEOMETRY),
                                                                        'longitude',    ST_X(ReceiverContact.gpsCoordinate::GEOMETRY)    
                                                                    ),
                                                'phone',            ReceiverContact.phone,
                                                'email',            ReceiverAppUser.email,
                                                'lastName',         ReceiverAppUser.lastName,
                                                'firstName',        ReceiverAppUser.firstName
                                            ),
                'foodDescription',          FoodListing.foodDescription,
                'perishable',               FoodListing.perishable,
                'availableUntilDate',       FoodListing.availableUntilDate,
                'claimedUnitsCount',        ClaimedFoodListing.claimedUnitsCount,
                'unitsLabel',               FoodListing.unitsLabel,
                'imgUrl',                   FoodListing.imgUrl,
                'totalWeight',              FoodListing.totalWeight
            ) AS deliveryFoodListing
    FROM        FoodListing
    INNER JOIN  ClaimedFoodListing                              ON FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
    INNER JOIN  AppUser AS DelivererAppUser                     ON _appUserKey = DelivererAppUser.appUserKey
    INNER JOIN  AppUserAvailability AS DelivererAvailability    ON DelivererAppUser.appUserKey = DelivererAvailability.appUserKey
    INNER JOIN  AppUser AS DonorAppUser                         ON FoodListing.donatedByAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo AS DonorContact                     ON DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  Organization AS DonorOrganization               ON DonorAppUser.appUserKey = DonorOrganization.appUserKey
    INNER JOIN  AppUserAvailability AS DonorAvailability        ON DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUser AS ReceiverAppUser                      ON ClaimedFoodListing.claimedByAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  ContactInfo AS ReceiverContact                  ON ReceiverAppUser.appUserKey = ReceiverContact.appUserKey
    INNER JOIN  Organization AS ReceiverOrganization            ON ReceiverAppUser.appUserKey = ReceiverOrganization.appUserKey
    INNER JOIN  AppUserAvailability AS ReceiverAvailability     ON ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    -- LEFT b/c we may or may not have a delivery lined up yet (deliverer may be looking for potential deliveries here).
    LEFT JOIN   DeliveryFoodListing                             ON  ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
                                                                -- Exclude Delivery Food Listings that have been cancelled!
                                                                AND NOT EXISTS (
                                                                    SELECT  1
                                                                    FROM    CancelledDeliveryFoodListing
                                                                    WHERE   DeliveryFoodListing.deliveryFoodListingKey = CancelledDeliveryFoodListing.deliveryFoodListingKey
                                                                )
    WHERE   (_maxDistanceMeters IS NULL     OR ST_DWITHIN(ReceiverContact.gpsCoordinate, DonorContact.gpsCoordinate, _maxDistanceMeters))
      AND   (_maxTotalWeight IS NULL        OR FoodListing.totalWeight <= _maxTotalWeight)
      AND   (_myScheduledDeliveries = FALSE OR DeliveryFoodListing.deliveryAppUserKey = _appUserKey)
      AND   (_unscheduledDeliveries = FALSE OR DeliveryFoodListing.scheduledStartTime IS NULL)
      -- When deliverer, receiver, and donor availabilities must all line up for future scheduling of delivery.
      AND   (_matchAvailability = FALSE     OR (    ReceiverAvailability.endTime > DelivererAvailability.startTime
                                                AND ReceiverAvailability.startTime < DelivererAvailability.endTime
                                                AND DonorAvailability.endTime > DelivererAvailability.startTime
                                                AND DonorAvailability.startTime < DelivererAvailability.endTime))
      AND   (_availableNow = FALSE          OR (    ReceiverAvailability.endTime > _currentTimestamp
                                                AND ReceiverAvailability.startTime < _currentTimestamp
                                                AND DonorAvailability.endTime > _currentTimestamp
                                                AND DonorAvailability.startTime < _currentTimestamp))  
    OFFSET      _retrievalOffset
    LIMIT       _retrievalAmount;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM getDeliveries(1, 0, 10);
