/**
 * Gets Delivery Food Listing elements based off of filter criteria.
 */
SELECT dropFunction('getDeliveryFoodListings');
CREATE OR REPLACE FUNCTION getDeliveryFoodListings
(
     _appUserKey            AppUser.appUserKey%TYPE,                    -- The key identifier of the logged in user (deliverer).
     _retrievalOffset       INTEGER,                                    -- The offset location where we will start retrieving results (beginning of range of results).
     _retrievalAmount       INTEGER,                                    -- The amount of results that we will retrieve (_retrievalOffset + _retrievalAmount is end of range).
     _maxDistance           INTEGER                      DEFAULT NULL,  -- The maximum distance (mi) of Donors and Reivers from the (potential) deliverer.
     _maxTotalWeight        FoodListing.totalWeight%TYPE DEFAULT NULL,  -- The maximum total weight of the delivery.
     _myScheduledDeliveries BOOLEAN                      DEFAULT FALSE  -- Set to TRUE if we should pull back deliveries that are scheduled or in process for deliverer.
)
RETURNS TABLE
(
    claimedFoodListingKey   ClaimedFoodListing.claimedFoodListingKey%TYPE,
    deliveryFoodListingKey  DeliveryFoodListing.deliveryFoodListingKey%TYPE,
    deliveryFoodListing     JSON
)
AS $$
    DECLARE _maxDistanceMeters INTEGER DEFAULT NULL;
BEGIN

    -- Calculate the max distance in meters if provided as argument (in miles).
    IF (_maxDistance IS NOT NULL)
    THEN
        _maxDistanceMeters := (_maxDistance * 1609.34); -- 1609.34 meters/mile
    END IF;

    -- If NULL is passed in for _myScheduledDeliveries, then set it to FALSE for consistency.
    IF (_myScheduledDeliveries IS NULL)
    THEN
        _myScheduledDeliveries := FALSE;
    END IF;

    -- Perform final return query using filters.
    RETURN QUERY
    SELECT  ClaimedFoodListing.claimedFoodListingKey,
            DeliveryFoodListing.deliveryFoodListingKey,
            -- @ts-sql class="DeliveryFoodListing" file="/shared/food-listings/delivery-food-listing.ts"
            JSON_BUILD_OBJECT (
                'claimedFoodListingKey',    ClaimedFoodListing.claimedFoodListingKey,
                'deliveryFoodListingKey',   DeliveryFoodListing.deliveryFoodListingKey,
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
    INNER JOIN  AppUser AS DonorAppUser                 ON FoodListing.donatedByAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  ContactInfo AS DonorContact             ON DonorAppUser.appUserKey = DonorContact.appUserKey
    INNER JOIN  Organization AS DonorOrganization       ON DonorAppUser.appUserKey = DonorOrganization.appUserKey
    INNER JOIN  ClaimedFoodListing                      ON FoodListing.foodListingKey = ClaimedFoodListing.foodListingKey
    INNER JOIN  AppUser AS ReceiverAppUser              ON ClaimedFoodListing.claimedByAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  ContactInfo AS ReceiverContact          ON ReceiverAppUser.appUserKey = ReceiverContact.appUserKey
    INNER JOIN  Organization AS ReceiverOrganization    ON ReceiverAppUser.appUserKey = ReceiverOrganization.appUserKey
    -- LEFT b/c we may or may not have a delivery lined up yet (deliverer may be looking for potential deliveries here).
    LEFT JOIN   DeliveryFoodListing                     ON ClaimedFoodListing.claimedFoodListingKey = DeliveryFoodListing.claimedFoodListingKey
    WHERE   (_maxDistanceMeters IS NULL     OR ST_DWITHIN(ReceiverContact.gpsCoordinate, DonorContact.gpsCoordinate, _maxDistanceMeters))
      AND   (_maxTotalWeight IS NULL        OR FoodListing.totalWeight <= _maxTotalWeight)
      AND   (_myScheduledDeliveries = FALSE OR DeliveryFoodListing.deliveryAppUserKey = _appUserKey)
    OFFSET  _retrievalOffset
    LIMIT   _retrievalAmount;

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM getDeliveryFoodListings(1, 0, 1000);
