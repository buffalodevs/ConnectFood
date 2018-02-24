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
                        -- Only include (Regaular) Donor Availability if it aligns with Receiver & Deliverer availability
                        CASE WHEN (     DonorAvailability.timeRange && DelivererAvailability.timeRange
                                    AND DonorAvailability.timeRange && ReceiverAvailability.timeRange )
                            THEN LOWER(DonorAvailability.timeRange)
                            ELSE TO_TIMESTAMP(0)::TIMESTAMP -- Won't possibly be the greatest.
                        END,
                        -- Only include (Specific) Food Listing Availability if it aligns with Receiver & Deliverer availability
                        CASE WHEN (     FoodListingAvailability.timeRange && DelivererAvailability.timeRange
                                    AND FoodListingAvailability.timeRange && ReceiverAvailability.timeRange)
                            THEN LOWER(FoodListingAvailability.timeRange)
                            ELSE TO_TIMESTAMP(0)::TIMESTAMP -- Won't possibly be greatest.
                        END,
                        LOWER(DelivererAvailability.timeRange)
                    )
                ) AS startTime,
                timestampToUtcText (
                    LEAST (
                        UPPER(ReceiverAvailability.timeRange),
                        -- Only include (Regaular) Donor Availability if it aligns with Receiver & Deliverer availability
                        CASE WHEN (     DonorAvailability.timeRange && DelivererAvailability.timeRange
                                    AND DonorAvailability.timeRange && ReceiverAvailability.timeRange )
                            THEN UPPER(DonorAvailability.timeRange)
                            ELSE (CURRENT_TIMESTAMP + INTERVAL '10' year)::TIMESTAMP -- Won't possibly be the least.
                        END,
                        -- Only include (Specific) Food Listing Availability if it aligns with Receiver & Deliverer availability
                        CASE WHEN (     FoodListingAvailability.timeRange && DelivererAvailability.timeRange
                                    AND FoodListingAvailability.timeRange && ReceiverAvailability.timeRange)
                            THEN UPPER(FoodListingAvailability.timeRange)
                            ELSE (CURRENT_TIMESTAMP + INTERVAL '10' year)::TIMESTAMP -- Won't possibly be the least.
                        END,
                        UPPER(DelivererAvailability.timeRange)
                    )
                ) AS endTime
        FROM        ClaimInfo
        INNER JOIN  FoodListing                                         ON ClaimInfo.foodListingKey = FoodListing.foodListingKey
        INNER JOIN  AppUser DonorAppUser                                ON FoodListing.donorAppUserKey = DonorAppUser.appUserKey
        INNER JOIN  AppUser ReceiverAppUser                             ON ClaimInfo.receiverAppUserKey = ReceiverAppUser.appUserKey
        INNER JOIN  AppUser DelivererAppUser                            ON DelivererAppUser.appUserKey = _delivererAppUserKey
        LEFT JOIN   FoodListingAvailability                             ON FoodListing.foodListingKey = FoodListingAvailability.foodListingKey
        LEFT JOIN   AppUserAvailabilityMeta DonorAvailabilityMeta       ON DonorAppUser.appUserKey = DonorAvailabilityMeta.appUserKey
        LEFT JOIN   AppUserAvailability     DonorAvailability           ON DonorAvailabilityMeta.appUserAvailabilityMetaKey = DonorAvailability.appUserAvailabilityMetaKey
        LEFT JOIN   AppUserAvailabilityMeta ReceiverAvailabilityMeta    ON ReceiverAppUser.appUserKey = ReceiverAvailabilityMeta.appUserKey
        LEFT JOIN   AppUserAvailability     ReceiverAvailability        ON ReceiverAvailabilityMeta.appUserAvailabilityMetaKey = ReceiverAvailability.appUserAvailabilityMetaKey
        LEFT JOIN   AppUserAvailabilityMeta DelivererAvailabilityMeta   ON DelivererAppUser.appUserKey = DelivererAvailabilityMeta.appUserKey
        LEFT JOIN   AppUserAvailability     DelivererAvailability       ON DelivererAvailabilityMeta.appUserAvailabilityMetaKey = DelivererAvailability.appUserAvailabilityMetaKey
                    -- Time overlap.
        WHERE       ClaimInfo.claimInfoKey = _claimInfoKey
        AND         ReceiverAvailability.timeRange && DelivererAvailability.timeRange
        AND         (
                            DonorAvailability.timeRange && DelivererAvailability.timeRange
                        OR  FoodListingAvailability.timeRange && DelivererAvailability.timeRange
                    )
        AND         (
                            DonorAvailability.timeRange && ReceiverAvailability.timeRange
                        OR  FoodListingAvailability.timeRange && ReceiverAvailability.timeRange
                    )
    ) AS timeRange
    ORDER BY startTime, endTime;

END;
$$ LANGUAGE plpgsql;


-- SELECT * FROM ClaimInfo ORDER BY claimInfoKey DESC;
SELECT * FROM getPossibleDeliveryTimes(7, 2);
