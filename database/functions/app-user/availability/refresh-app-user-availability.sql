SELECT dropFunction('refreshAppUserAvailability');


/**
 * Refreshes all absolute AppUser Availability (regular/weekly) timestamp ranges by offsetting any past date/times into the future.
 * NOTE: This should not be directly invoked, but should be invoked by some sort of cron job on a regular basis.
 */
CREATE OR REPLACE FUNCTION refreshAppUserAvailability()
RETURNS VOID
AS $$
BEGIN

    UPDATE      Availability
    SET         timeRange = rangeToWeekdayOfWeek( timeRange, timezone, weekRep )
    FROM        AppUserAvailabilityMap
    INNER JOIN  ContactInfo ON AppUserAvailabilityMap.appUserKey = ContactInfo.appUserKey
    WHERE       Availability.availabilityKey = AppUserAvailabilityMap.availabilityKey;

END;
$$ LANGUAGE plpgsql;


SELECT refreshAppUserAvailability();
-- SELECT Availability.* FROM Availability
-- INNER JOIN AppUserAvailabilityMap ON Availability.availabilityKey = AppUserAvailabilityMap.availabilityKey