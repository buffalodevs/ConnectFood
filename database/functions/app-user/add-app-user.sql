
SELECT dropFunction('addAppUser');

CREATE OR REPLACE FUNCTION addAppUser
(
    _email                      AppUser.email%TYPE, 
    _password                   AppUserPassword.password%TYPE,
    _lastName                   AppUser.lastName%TYPE,
    _firstName                  AppUser.firstName%TYPE,
    _address                    ContactInfo.address%TYPE,
    _latitude                   NUMERIC(9, 6),
    _longitude                  NUMERIC(9, 6),
    _timezone                   ContactInfo.timezone%TYPE,
    _city                       ContactInfo.city%TYPE,
    _state                      ContactInfo.state%TYPE,
    _zip                        ContactInfo.zip%TYPE,
    _phone                      ContactInfo.phone%TYPE,
    _appUserType                AppUser.appUserType%TYPE,
    _availabilityMetaTimeRanges JSON[],
    _organizationName           Organization.name%TYPE,
    _taxId                      Organization.taxId%TYPE,
    _driversLicenseState        DelivererInfo.driversLicenseState%TYPE,
    _driversLicenseID           DelivererInfo.driversLicenseID%TYPE
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
    PERFORM addUpdateContactInfo (_appUserKey, _address, _latitude, _longitude, _timezone, _city, _state, _zip, _phone);

    -- Add or update the new user's availability times (same work for both operations... does total refresh).
    PERFORM addUpdateAppUserAvailability (_appUserKey, _availabilityMetaTimeRanges, _timezone);

    -- Add the new user's organization data if the user is and oragnization.
    IF (_appUserType = 'Donor'::AppUserType OR _appUserType = 'Receiver'::AppUserType)
    THEN
        INSERT INTO Organization (appUserKey, name, taxId)
        VALUES      (_appUserKey, _organizationName, _taxId);
    ELSE
        INSERT INTO DelivererInfo (appUserKey, driversLicenseState, driversLicenseID)
        VALUES      (_appUserKey, _driversLicenseState, _driversLicenseID);
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
