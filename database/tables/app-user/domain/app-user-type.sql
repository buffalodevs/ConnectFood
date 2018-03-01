--DROP TYPE AppUserType CASCADE;

/** 
 *  A domain enum (table) that holds all possible hard-coded App User types.
 */
DO $$
BEGIN

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appusertype')
    THEN
        CREATE TYPE AppUserType AS ENUM ();
    END IF;

END$$;


ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Receiver';
ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Donor';
ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Deliverer';

SELECT unnest(enum_range(NULL::AppUserType));
