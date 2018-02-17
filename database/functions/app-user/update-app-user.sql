SELECT dropFunction ('updateAppUser');

/**
 * Updates a given App User.
 */
CREATE OR REPLACE FUNCTION updateAppUser
(
    _appUserKey                 AppUser.appUserKey%TYPE,
    _email                      AppUser.email%TYPE                  DEFAULT NULL, 
    _password                   AppUserPassword.password%TYPE       DEFAULT NULL,
    _lastName                   AppUser.lastName%TYPE               DEFAULT NULL,
    _firstName                  AppUser.firstName%TYPE              DEFAULT NULL,
    _address                    ContactInfo.address%TYPE            DEFAULT NULL,
    _latitude                   NUMERIC(9, 6)                       DEFAULT NULL,
    _longitude                  NUMERIC(9, 6)                       DEFAULT NULL,
    _utcOffsetMins              ContactInfo.utcOffsetMins%TYPE      DEFAULT NULL,
    _city                       ContactInfo.city%TYPE               DEFAULT NULL,
    _state                      ContactInfo.state%TYPE              DEFAULT NULL,
    _zip                        ContactInfo.zip%TYPE                DEFAULT NULL,
    _phone                      ContactInfo.phone%TYPE              DEFAULT NULL,
    _appUserType                AppUser.appUserType%TYPE            DEFAULT NULL,
    _availabilityMetaTimeRanges JSON[]                              DEFAULT NULL,
    _organizationName           Organization.name%TYPE              DEFAULT NULL,
    _taxId                      Organization.taxId%TYPE             DEFAULT NULL
)
-- Returns the new App User's information.
RETURNS TABLE
(
    appUserKey  AppUser.appUserKey%TYPE,
    sessionData JSON
)
AS $$
BEGIN

    -- First, if email is being updated, ensure that new email does not already exist (fail fast)!
    IF EXISTS (
        SELECT  1
        FROM    AppUser
        WHERE   AppUser.email = _email
          AND   AppUser.appUserKey <> _appUserKey
    )
    THEN
        RAISE EXCEPTION 'Duplicate email provided';
    END IF;

    -- Permorm the update on the AppUser table fields and get keys to related tables that may need updating.
    UPDATE  AppUser
    SET     email       = COALESCE(_email, email),
            lastName    = COALESCE(_lastName, lastName),
            firstName   = COALESCE(_firstName, firstName),
            appUserType = COALESCE(_appUserType, appUserType)
    WHERE   AppUser.appUserKey = _appUserKey;

    -- Update any ContactInfo fields related to AppUser being updated.
    PERFORM addUpdateContactInfo(_appUserKey, _address, _latitude, _longitude, _utcOffsetMins, _city, _state, _zip, _phone);

    -- Update any Organization fields related to AppUser being updated.
    UPDATE  Organization
    SET     name = COALESCE(_organizationName, name),
            taxId = COALESCE(_taxId, taxId)
    WHERE   Organization.appUserKey = _appUserKey;

    -- Update password related to AppUser being updated. We keep track of all old passwords, so this is an insert!
    IF (_password IS NOT NULL)
    THEN
        INSERT INTO AppUserPassword (appUserKey, password)
        VALUES      (_appUserKey, _password);
    END IF;

    IF (_availabilityMetaTimeRanges IS NOT NULL)
    THEN
        PERFORM addUpdateAppUserAvailability(_appUserKey, _availabilityMetaTimeRanges);
    END IF;

    RETURN QUERY
    SELECT getAppUserSessionData.appUserKey, getAppUserSessionData.sessionData FROM getAppUserSessionData(_appUserKey);
    
END;
$$ LANGUAGE plpgsql;


--SELECT updateAppUser(1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Donor');
