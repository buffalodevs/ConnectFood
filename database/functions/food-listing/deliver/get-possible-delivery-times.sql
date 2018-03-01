SELECT dropFunction('getPossibleDeliveryTimes');

/**
 * Checks for Donor, Receiver, and Deliverer overlaps in availability for delivery.
 * The Donor and Receiver are associated with a given Claimed Food Listing, and the Deliverer is interested in the listing for delivery.
 */
CREATE OR REPLACE FUNCTION getPossibleDeliveryTimes
(
     _claimInfoKey          ClaimInfo.claimInfoKey%TYPE,            -- This is the key of the Claimed Food Listing.
     _delivererAppUserKey   DeliveryInfo.delivererAppUserKey%TYPE   -- This is the key of the user (deliverer) who is checking Donor, Receiver, Deliverer availability overlap(s).
)
RETURNS SETOF JSON -- The availability time ranges.
AS $$
BEGIN

    RETURN QUERY
    SELECT JSON_BUILD_OBJECT (
        '_startTime',   timeRange.startTime,
        '_endTime',     timeRange.endTime
    )
    FROM (
        SELECT  timestampToUtcText (
                    GREATEST (
                        LOWER(ReceiverAvailability.timeRange),
                        LOWER(DonorAvailability.timeRange),
                        LOWER(DelivererAvailability.timeRange)
                    )
                ) AS startTime,
                timestampToUtcText (
                    LEAST (
                        UPPER(ReceiverAvailability.timeRange),
                        UPPER(DonorAvailability.timeRange),
                        UPPER(DelivererAvailability.timeRange)
                    )
                ) AS endTime
        FROM        ClaimInfo
        INNER JOIN  FoodListing                                         ON  ClaimInfo.foodListingKey = FoodListing.foodListingKey
        INNER JOIN  AppUser DonorAppUser                                ON  FoodListing.donorAppUserKey = DonorAppUser.appUserKey
        INNER JOIN  AppUser ReceiverAppUser                             ON  ClaimInfo.receiverAppUserKey = ReceiverAppUser.appUserKey
        INNER JOIN  AppUser DelivererAppUser                            ON  DelivererAppUser.appUserKey = _delivererAppUserKey
        LEFT JOIN   AppUserAvailabilityMap  DonorAvailabilityMap        ON  DonorAppUser.appUserKey = DonorAvailabilityMap.appUserKey
        LEFT JOIN   FoodListingAvailabilityMap                          ON  FoodListing.foodListingKey = FoodListingAvailabilityMap.foodListingKey
        LEFT JOIN   Availability            DonorAvailability           ON  DonorAvailabilityMap.availabilityKey = DonorAvailability.availabilityKey
                                                                        OR  FoodListingAvailabilityMap.availabilityKey = DonorAvailability.availabilityKey
        LEFT JOIN   AppUserAvailabilityMap  ReceiverAvailabilityMap     ON  ReceiverAppUser.appUserKey = ReceiverAvailabilityMap.appUserKey
        LEFT JOIN   ClaimAvailabilityMap                                ON  ClaimInfo.claimInfoKey = ClaimAvailabilityMap.claimInfoKey
        LEFT JOIN   Availability            ReceiverAvailability        ON  ReceiverAvailabilityMap.availabilityKey = ReceiverAvailability.availabilityKey
                                                                        OR  ClaimAvailabilityMap.availabilityKey = ReceiverAvailability.availabilityKey
        LEFT JOIN   AppUserAvailabilityMap  DelivererAvailabilityMap    ON  DelivererAppUser.appUserKey = DelivererAvailabilityMap.appUserKey
        LEFT JOIN   Availability            DelivererAvailability       ON  DelivererAvailabilityMap.availabilityKey = DelivererAvailability.availabilityKey
                    -- Time overlap.
        WHERE       ClaimInfo.claimInfoKey = _claimInfoKey
          AND       DelivererAvailability.timeRange && DonorAvailability.timeRange
          AND       DonorAvailability.timeRange && ReceiverAvailability.timeRange
          AND       ReceiverAvailability.timeRange && DelivererAvailability.timeRange
    ) AS timeRange
    ORDER BY startTime, endTime;

END;
$$ LANGUAGE plpgsql;


-- SELECT * FROM ClaimInfo ORDER BY claimInfoKey DESC;
-- SELECT * FROM AppUser;
-- SELECT * FROM getPossibleDeliveryTimes(2, 64);
