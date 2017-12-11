SELECT dropFunction('getPossibleDeliveryTimes');

/**
 * Checks for Donor, Receiver, and Deliverer overlaps in availability for delivery.
 * The Donor and Receiver are associated with a given Claimed Food Listing, and the Deliverer is interested in the listing for delivery.
 */
CREATE OR REPLACE FUNCTION getPossibleDeliveryTimes
(
     _claimedFoodListingKey ClaimedFoodListing.claimedFoodListingKey%TYPE,  -- This is the key of the Claimed Food Listing.
     _deliveryAppUserKey    DeliveryFoodListing.deliveryAppUserKey%TYPE     -- This is the key of the user (deliverer) who is checking Donor, Receiver, Deliverer availability overlap(s).
)
RETURNS SETOF JSON -- The availability time ranges.
AS $$
BEGIN

    RETURN QUERY
                -- @ts-sql class="TimeRange" file="/shared/app-user/time-range.ts"
    SELECT      JSON_BUILD_OBJECT (
                    'weekday',      (SELECT EXTRACT(DOW FROM DelivererAvailability.startTime)),
                    'startTime',    TO_CHAR (
                                        GREATEST (
                                            ReceiverAvailability.startTime,
                                            DonorAvailability.startTime,
                                            DelivererAvailability.startTime
                                        ),
                                        'HH12:MI AM'
                                    ),
                    'endTime',      TO_CHAR (
                                        LEAST (
                                            ReceiverAvailability.endTime,
                                            DonorAvailability.endTime,
                                            DelivererAvailability.endTime
                                        ),
                                        'HH12:MI AM'
                                    )
                )
    FROM        ClaimedFoodListing
    INNER JOIN  FoodListing                                 ON ClaimedFoodListing.claimedFoodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser ReceiverAppUser                     ON ClaimedFoodListing.claimedByAppUserKey = ReceiverAppUser.appUserKey
    INNER JOIN  AppUser DonorAppUser                        ON FoodListing.donatedByAppUserKey = DonorAppUser.appUserKey
    INNER JOIN  AppUser DeliveryAppUser                     ON _deliveryAppUserKey = DeliveryAppUser.appUserKey
    INNER JOIN  AppUserAvailability ReceiverAvailability    ON ReceiverAppUser.appUserKey = ReceiverAvailability.appUserKey
    INNER JOIN  AppUserAvailability DonorAvailability       ON DonorAppUser.appUserKey = DonorAvailability.appUserKey
    INNER JOIN  AppUserAvailability DelivererAvailability   ON DeliveryAppUser.appUserKey = DelivererAvailability.appUserKey
                -- Time overlap.
    WHERE       ReceiverAvailability.endTime > DelivererAvailability.startTime
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


--SELECT * FROM getPossibleDeliveryTimes(33, 1);
