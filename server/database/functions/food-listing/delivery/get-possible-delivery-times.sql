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
                    'startTime',    GREATEST (
                                        claimedAvailability.startTime,
                                        donatedAvailability.startTime,
                                        deliverAvailability.startTime
                                    ),
                    'endTime',      LEAST (
                                        claimedAvailability.endTime,
                                        donatedAvailability.endTime,
                                        deliverAvailability.endTime
                                    )
                )
    FROM        ClaimedFoodListing
    INNER JOIN  FoodListing                                 ON ClaimedFoodListing.claimedFoodListingKey = FoodListing.foodListingKey
    INNER JOIN  AppUser ClaimedAppUser                      ON ClaimedFoodListing.claimedByAppUserKey = CLaimedAppUser.appUserKey
    INNER JOIN  AppUser DonatedAppUser                      ON FoodListing.donatedByAppUserKey = DonatedAppUser.appUserKey
    INNER JOIN  AppUser DeliveryAppUser                     ON _deliveryAppUserKey = DeliveryAppUser.appUserKey
    INNER JOIN  AppUserAvailability ClaimedAvailability     ON ClaimedAppUser.appUserKey = ClaimedAvailability.appUserKey
    INNER JOIN  AppUserAvailability DonatedAvailability     ON DonatedAppUser.appUserKey = DonatedAvailability.appUserKey
    INNER JOIN  AppUserAvailability DeliverAvailability     ON DeliveryAppUser.appUserKey = DeliverAvailability.appUserKey
                -- Time overlap.
    WHERE       ClaimedAvailability.endTime > DonatedAvailability.startTime
      AND       ClaimedAvailability.startTime < DonatedAvailability.endTime
      AND       ClaimedAvailability.endTime > DeliverAvailability.startTime
      AND       ClaimedAvailability.startTime < DeliverAvailability.endTime
      AND       DonatedAvailability.endTime > DeliverAvailability.startTime
      AND       DonatedAvailability.startTime < DeliverAvailability.endTime
    ORDER BY    GREATEST (
                    claimedAvailability.startTime,
                    donatedAvailability.startTime,
                    deliverAvailability.startTime
                );

END;
$$ LANGUAGE plpgsql;


--SELECT * FROM getPossibleDeliveryTimes(33, 1);
