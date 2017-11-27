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

-- Fill the Enum with all of our App User Types. Each one has an external string representation, but is internally an integer!
ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Receiver';
ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Donor';
ALTER TYPE AppUserType ADD VALUE IF NOT EXISTS 'Driver';

SELECT unnest(enum_range(NULL::AppUserType)) AS appUserType;
