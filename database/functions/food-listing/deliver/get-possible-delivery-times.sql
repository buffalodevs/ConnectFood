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
                -- @ts-sql class="TimeRange" file="/shared/app-user/time-range.ts"
    SELECT      JSON_BUILD_OBJECT (
                    '_startTime',   timestampToUtcText (
                                        GREATEST (
                                            LOWER(ReceiverAvailability.timeRange),
                                            LOWER(DonorAvailability.timeRange),
                                            LOWER(DelivererAvailability.timeRange)
                                        )
                                    ),
                    '_endTime',     timestampToUtcText (
                                        LEAST (
                                            UPPER(ReceiverAvailability.timeRange),
                                            UPPER(DonorAvailability.timeRange),
                                            UPPER(DelivererAvailability.timeRange)
                                        )
                                    )
                )
    FROM        ClaimInfo
    INNER JOIN  FoodListing                                 ON ClaimInfo.foodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser ReceiverAppUser                     ON ClaimInfo.receiverAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  AppUser DonorAppUser                        ON FoodListing.donorAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  AppUser DelivererAppUser                    ON DelivererAppUser.appUserKey = _delivererAppUserKey
    INNER JOIN  AppUserAvailability ReceiverAvailability    ON ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    INNER JOIN  AppUserAvailability DonorAvailability       ON DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUserAvailability DelivererAvailability   ON DelivererAppUser.appUserKey = DelivererAvailability.appUserKey
                -- Time overlap.
    WHERE       ClaimInfo.claimInfoKey = _claimInfoKey
      AND       ReceiverAvailability.timeRange && DelivererAvailability.timeRange
      AND       DonorAvailability.timeRange && DelivererAvailability.timeRange
      AND       DonorAvailability.timeRange && ReceiverAvailability.timeRange
    ORDER BY    GREATEST (
                    LOWER(ReceiverAvailability.timeRange),
                    LOWER(DonorAvailability.timeRange),
                    LOWER(DelivererAvailability.timeRange)
                );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM ClaimInfo ORDER BY claimInfoKey DESC;
--SELECT * FROM getPossibleDeliveryTimes(77, 1);
