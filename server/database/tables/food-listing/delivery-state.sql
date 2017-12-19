--DROP TYPE DeliveryState CASCADE;

/** 
 *  A domain enum (table) that holds all possible hard-coded Delivery States.
 */
DO $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deliverystate')
    THEN
        CREATE TYPE DeliveryState AS ENUM ();
    END IF;

END$$;

-- @ts-sql enum="DeliveryState" file="/shared/food-listings/delivery-food-listing.ts"
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'unscheduled';         -- No uncancelled entry in DeliveryFoodListing
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'scheduled';           -- scheduledStartTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'started';             -- startTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'pickedUp';            -- pickUpTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'droppedOff';          -- dropOffTime

SELECT unnest(enum_range(NULL::DeliveryState)) AS deliveryState;
