DROP TYPE DeliveryState CASCADE;

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

-- Fill the Enum with all of our Delivery States. Each one has an external string representation, but is internally an integer!
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Delivery scheduled';      -- scheduledStartTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'On route to donor';       -- startTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'On route to receiver';    -- pickUpTime
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Delivery completed';      -- dropOffTime

SELECT unnest(enum_range(NULL::DeliveryState)) AS deliveryState;
