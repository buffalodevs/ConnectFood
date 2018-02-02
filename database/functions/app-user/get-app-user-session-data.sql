SELECT dropFunction('getAppUserSessionData');

/**
 * Gets all data pertaining to an AppUser's session. Also, collects password for session initialization/verification.
 */
CREATE OR REPLACE FUNCTION getAppUserSessionData
(
    _appUserKey         AppUser.appUserKey%TYPE     DEFAULT NULL,
    _email              AppUser.email%TYPE          DEFAULT NULL,
    _includePassword    BOOLEAN                     DEFAULT FALSE, -- Excplicitely set to TRUE to bring back password. Extra security measure.
    _lastName           AppUser.lastName%TYPE       DEFAULT NULL,
    _firstName          AppUser.firstName%TYPE      DEFAULT NULL,
    _organizationName   Organization.name%TYPE      DEFAULT NULL
)
RETURNS TABLE
(
    appUserKey  AppUser.appUserKey%TYPE,
    password    AppUserPassword.password%TYPE,
    sessionData JSON
)
AS $$

    SELECT  AppUser.appUserKey,
            -- NOTE: Password will not be included in the typescript object due to security concerns!
            CASE (_includePassword)
                WHEN TRUE THEN AppUserPassword.password
                ELSE           CAST(NULL AS CHAR(60))
            END,
            -- @ts-sql class="SessionData" file="/server/src/common-util/session-data.ts"
            JSON_BUILD_OBJECT (
                'appUserKey',           AppUser.appUserKey,
                -- @ts-sql class="AppUserInfo" file="/shared/authentication/app-user-info.ts"
                'appUserInfo',          JSON_BUILD_OBJECT (
                                            'email',            AppUser.email,
                                            'appUserType',      AppUser.appUserType,
                                            'organizationName', Organization.name,
                                            'lastName',         AppUser.lastName,
                                            'firstName',        AppUser.firstName,
                                            'address',          ContactInfo.address,
                                            'city',             ContactInfo.city,
                                            'state',            ContactInfo.state,
                                            'zip',              ContactInfo.zip,
                                            -- @ts-sql class="GPSCoordinate" file="/shared/common-util/geocode.ts"
                                            'gpsCoordinate',    JSON_BUILD_OBJECT (
                                                                    'latitude',         ST_Y(ContactInfo.gpsCoordinate::GEOMETRY),
                                                                    'longitude',        ST_X(ContactInfo.gpsCoordinate::GEOMETRY)
                                                                ),
                                            'utcOffsetMins',    ContactInfo.utcOffsetMins,
                                            'phone',            ContactInfo.phone,
                                            'availability',     (
                                                                    SELECT  ARRAY_AGG (
                                                                                -- @ts-sql class="TimeRangeStr" file="/shared/common-util/time-range.ts"
                                                                                JSON_BUILD_OBJECT (
                                                                                    '_startTime',    timestampToUtcText(AppUserAvailability.startTime),
                                                                                    '_endTime',      timestampToUtcText(AppUserAvailability.endTime)
                                                                                )
                                                                            )
                                                                    FROM    AppUserAvailability
                                                                    WHERE   AppUserAvailability.appUserKey = AppUser.appUserKey
                                                                ),
                                            'taxId',            Organization.taxId
                                        ),
                'verificationToken',    UnverifiedAppUser.verificationToken
            )
    FROM AppUser
    INNER JOIN AppUserPassword      ON AppUser.appUserKey = AppUserPassword.appUserKey
    INNER JOIN ContactInfo          ON AppUser.appUserKey = ContactInfo.appUserKey
    LEFT JOIN  Organization         ON AppUser.appUserKey = Organization.appUserKey
    LEFT JOIN  UnverifiedAppUser    ON AppUser.appUserKey = UnverifiedAppUser.appUserKey
    WHERE (_appUserKey IS NULL       OR AppUser.appUserKey = _appUserKey)
      AND (_email IS NULL            OR AppUser.email = _email)
      AND (_lastName IS NULL         OR AppUser.lastName = _lastName)
      AND (_firstName IS NULL        OR AppUser.firstName = _firstName)
      AND (_organizationName IS NULL OR Organization.name = _organizationName)
      AND (AppUserPassword.appUserPasswordKey = ( SELECT    appUserPasswordKey
                                                  FROM      AppUserPassword AppUserPasswordDate
                                                  WHERE     AppUserPasswordDate.appUserKey = AppUser.appUserKey
                                                  ORDER BY  AppUserPasswordDate.createDate DESC
                                                  LIMIT     1 ));

$$ LANGUAGE sql;

SELECT * FROM getAppUserSessionData(1);
