/** 
 *  A domain enum (table) that holds all possible hard-coded vehicle types.
 */
DO $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vehicletype')
    THEN
        CREATE TYPE VehicleType AS ENUM ();
    END IF;

END$$;


ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Sedan';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'SUV';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Van';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Commercial Truck';

SELECT unnest(enum_range(NULL::VehicleType));
