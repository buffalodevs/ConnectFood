SELECT dropFunction('getPossibleDeliveryTimes');

/**
 * Checks for Donor, Receiver, and Deliverer overlaps in availability for delivery.
 * The Donor and Receiver are associated with a given Claimed Food Listing, and the Deliverer is interested in the listing for delivery.
 */
CREATE OR REPLACE FUNCTION getPossibleDeliveryTimes
(
     _claimedFoodListingKey ClaimedFoodListing.claimedFoodListingKey%TYPE,  -- This is the key of the Claimed Food Listing.
     _delivererAppUserKey   DeliveryFoodListing.delivererAppUserKey%TYPE    -- This is the key of the user (deliverer) who is checking Donor, Receiver, Deliverer availability overlap(s).
)
RETURNS SETOF JSON -- The availability time ranges.
AS $$
BEGIN

    RETURN QUERY
                -- @ts-sql class="TimeRange" file="/shared/app-user/time-range.ts"
    SELECT      JSON_BUILD_OBJECT (
                    '_startTime',   timestampToUtcText (
                                        GREATEST (
                                            ReceiverAvailability.startTime,
                                            DonorAvailability.startTime,
                                            DelivererAvailability.startTime
                                        )
                                    ),
                    '_endTime',     timestampToUtcText (
                                        LEAST (
                                            ReceiverAvailability.endTime,
                                            DonorAvailability.endTime,
                                            DelivererAvailability.endTime
                                        )
                                    )
                )
    FROM        ClaimedFoodListing
    INNER JOIN  FoodListing                                 ON ClaimedFoodListing.foodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser ReceiverAppUser                     ON ClaimedFoodListing.receiverAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  AppUser DonorAppUser                        ON FoodListing.donorAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  AppUser DelivererAppUser                    ON DelivererAppUser.appUserKey = _delivererAppUserKey
    INNER JOIN  AppUserAvailability ReceiverAvailability    ON ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    INNER JOIN  AppUserAvailability DonorAvailability       ON DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUserAvailability DelivererAvailability   ON DelivererAppUser.appUserKey = DelivererAvailability.appUserKey
                -- Time overlap.
    WHERE       ClaimedFoodListing.claimedFoodListingKey = _claimedFoodListingKey
      AND       ReceiverAvailability.endTime > DelivererAvailability.startTime
      AND       ReceiverAvailability.startTime < DelivererAvailability.endTime
      AND       DonorAvailability.endTime > DelivererAvailability.startTime
      AND       DonorAvailability.startTime < DelivererAvailability.endTime
    ORDER BY    GREATEST (
                    ReceiverAvailability.startTime,
                    DonorAvailability.startTime,
                    DelivererAvailability.startTime
                );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM ClaimedFoodListing ORDER BY claimedFoodListingKey DESC;
--SELECT * FROM getPossibleDeliveryTimes(77, 1);
