
SELECT dropFunction('addAppUser');

CREATE OR REPLACE FUNCTION addAppUser
(
    _email                  AppUser.email%TYPE, 
    _password               AppUserPassword.password%TYPE,
    _lastName               AppUser.lastName%TYPE,
    _firstName              AppUser.firstName%TYPE,
    _address                ContactInfo.address%TYPE,
    _latitude               NUMERIC(9, 6),
    _longitude              NUMERIC(9, 6),
    _utcOffsetMins          ContactInfo.utcOffsetMins%TYPE,
    _city                   ContactInfo.city%TYPE,
    _state                  ContactInfo.state%TYPE,
    _zip                    ContactInfo.zip%TYPE,
    _phone                  ContactInfo.phone%TYPE,
    _appUserType            AppUser.appUserType%TYPE,
    _availabilityDateRanges JSON[],
    _organizationName       Organization.name%TYPE,
    _taxId                  Organization.taxId%TYPE
)
-- Returns the new App User's information.
RETURNS TABLE
(
    appUserKey  AppUser.appUserKey%TYPE,
    sessionData JSON
)
AS $$
    DECLARE _appUserKey AppUser.appUserKey%TYPE;
BEGIN

    -- Ensure that email does not already exist (fail fast)!
    IF EXISTS (
        SELECT  1
        FROM    AppUser
        WHERE   email = _email
    )
    THEN
        RAISE EXCEPTION 'Duplicate email provided';
    END IF;


    -- Add the new user and get reference to entry.
    INSERT INTO AppUser (email, lastName, firstName, appUserType)                  
    VALUES      (_email, _lastName, _firstName, _appUserType)
    RETURNING   AppUser.appUserKey
    INTO        _appUserKey;

    -- Insert the new user's password.
    INSERT INTO AppUserPassword (appUserKey, password)
    VALUES      (_appUserKey, _password);

    -- Add the new user's contact info.
    PERFORM addOrUpdateContactInfo (_appUserKey, _address, _latitude, _longitude, _utcOffsetMins, _city, _state, _zip, _phone);

    -- Add or update the new user's availability times (same work for both operations... does total refresh).
    PERFORM addOrUpdateAvailability (_appUserKey, _availabilityTimeRanges);

    -- Add the new user's organization data if the user is and oragnization.
    IF (_organizationName IS NOT NULL)
    THEN
        INSERT INTO Organization (appUserKey, name, taxId)
        VALUES      (_appUserKey, _organizationName, _taxId);
    END IF;

    -- Add the new user to table of unverified app users (needs email verification).
    PERFORM addUnverifiedAppUser(_appUserKey);

    RETURN QUERY
    SELECT getAppUserSessionData.appUserKey, getAppUserSessionData.sessionData FROM getAppUserSessionData(_appUserKey);

END;
$$ LANGUAGE plpgsql;


/*
SELECT * FROM addAppUser('testemail7@test.com', 'testPass', 'testLast', 'testFirst', '11 test rd.',
                         43.123456, 83.33, 'Test City', 'NY', 12345, '777-777-7777', 'Donor', '{"(Monday, 11:00 AM, 3:00 PM)"}'::TimeRange[]);
*/
