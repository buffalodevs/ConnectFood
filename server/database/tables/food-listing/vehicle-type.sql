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

-- Fill the Enum with all of our Food Types. Each one has an external string representation, but is internally an integer!
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Sedan';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'SUV';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Van';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Pickup Truck';
ALTER TYPE VehicleType ADD VALUE IF NOT EXISTS 'Commercial Truck';

SELECT unnest(enum_range(NULL::VehicleType)) AS VehicleType;