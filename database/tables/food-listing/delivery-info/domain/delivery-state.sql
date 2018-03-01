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


ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Unscheduled';
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Scheduled';
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Started';
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Picked Up';
ALTER TYPE DeliveryState ADD VALUE IF NOT EXISTS 'Dropped Off';

SELECT unnest(enum_range(NULL::DeliveryState));
