SELECT dropFunction('refreshAppUserAvailability');


/**
 * Refreshes all absolute AppUser Availability timestamp ranges based on associated metadata in AppUserAvailabilityMeta.
 * Generates absolute timestamp ranges for the following 2 weeks (this week and the next). Removes all absolute timestamp ranges on the previous week.
 * NOTE: This should not be directly invoked, but should be invoked by some sort of cron job on a regular basis.
 */
CREATE OR REPLACE FUNCTION refreshAppUserAvailability()
RETURNS VOID
AS $$
BEGIN

    -- Generate absolute Availability timestamp ranges for 2 weeks away (current week and next week should have already been generated).
    UPDATE  Availability
    SET     timeRange = rangeToWeekdayOfWeek (
                            timeRange,
                            (
                                SELECT      ContactInfo.timezone
                                FROM        ContactInfo
                                INNER JOIN  AppUserAvailabilityMap ON ContactInfo.appUserkey = AppUserAvailabilityMap.appUserKey
                                WHERE       AppUserAvailabilityMap.availabilityKey = Availability.availabilityKey
                            ),
                            2
                        )
    -- Only want to update the availability range that falls in previous week (so want min availability time range for user).
    WHERE   LOWER(Availability.timeRange) IN (
                SELECT      MIN(LOWER(AvailabilitySub.timeRange))
                FROM        AppUserAvailabilityMap
                INNER JOIN  Availability AS AvailabilitySub ON AppUserAvailabilityMap.availabilityKey = AvailabilitySub.availabilityKey
                GROUP BY    AppUserAvailabilityMap.appUserKey
            );

END;
$$ LANGUAGE plpgsql;


SELECT refreshAppUserAvailability();
