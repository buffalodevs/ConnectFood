/** 
 *  A domain enum (table) that holds all possible hard-coded Food Listings Statuses.
 */
DO $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'foodlistingsstatus')
    THEN
        CREATE TYPE FoodListingsStatus AS ENUM ();
    END IF;

END$$;


ALTER TYPE FoodListingsStatus ADD VALUE IF NOT EXISTS 'Unclaimed Listings';
ALTER TYPE FoodListingsStatus ADD VALUE IF NOT EXISTS 'My Donated Listings';
ALTER TYPE FoodListingsStatus ADD VALUE IF NOT EXISTS 'My Claimed Listings';
ALTER TYPE FoodListingsStatus ADD VALUE IF NOT EXISTS 'Unscheduled Deliveries';
ALTER TYPE FoodListingsStatus ADD VALUE IF NOT EXISTS 'My Scheduled Deliveries';

SELECT unnest(enum_range(NULL::FoodListingsStatus));
