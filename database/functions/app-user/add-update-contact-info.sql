SELECT dropFunction('addUpdateContactInfo');

CREATE OR REPLACE FUNCTION addUpdateContactInfo
(
    _appUserKey     ContactInfo.AppUserKey%TYPE,
    _address        ContactInfo.address%TYPE        DEFAULT NULL,
    _latitude       NUMERIC(9, 6)                   DEFAULT NULL,
    _longitude      NUMERIC(9, 6)                   DEFAULT NULL,
    _utcOffsetMins  ContactInfo.utcOffsetMins%TYPE  DEFAULT NULL,
    _city           ContactInfo.city%TYPE           DEFAULT NULL,
    _state          ContactInfo.state%TYPE          DEFAULT NULL,
    _zip            ContactInfo.zip%TYPE            DEFAULT NULL,
    _phone          ContactInfo.phone%TYPE          DEFAULT NULL
)
RETURNS ContactInfo.contactInfoKey%TYPE -- Will return the contactInfoKey
AS $$
    DECLARE _isAdd              BOOLEAN;
    DECLARE _gpsCoordinate      ContactInfo.gpsCoordinate%TYPE  DEFAULT NULL;
    DECLARE _contactInfoKey     ContactInfo.contactInfoKey%TYPE; 
BEGIN

    _isAdd := NOT EXISTS (
        SELECT  1
        FROM    ContactInfo
        WHERE   ContactInfo.appUserKey = _appUserKey
    );

    -- On update, some fields can be null, and we want to ignore them (such as latitude/longitude)!
    IF (_isAdd OR _latitude IS NOT NULL)
    THEN
        _gpsCoordinate := creategpsCoordinate(_latitude, _longitude);
    END IF;


    IF (_isAdd) -- Add
    THEN

        INSERT INTO ContactInfo
        (
            appUserKey,
            address,
            gpsCoordinate,
            city,
            state,
            zip,
            phone,
            utcOffsetMins
        )
        VALUES
        (
            _appUserKey,
            _address,
            _gpsCoordinate,
            _city,
            _state,
            _zip,
            _phone,
            _utcOffsetMins
        )
        RETURNING   ContactInfo.contactInfoKey
        INTO        _contactInfoKey;

    ELSE -- Update

        UPDATE      ContactInfo
        SET         address         = COALESCE(_address, address),
                    gpsCoordinate   = COALESCE(_gpsCoordinate, gpsCoordinate),
                    city            = COALESCE(_city, city),
                    state           = COALESCE(_state, state),
                    zip             = COALESCE(_zip, zip),
                    phone           = COALESCE(_phone, phone),
                    utcOffsetMins   = COALESCE(_utcOffsetMins, utcOffsetMins)
        WHERE       appUserKey = _appUserKey
        RETURNING   contactInfoKey
        INTO        _contactInfoKey;

    END IF;


    RETURN _contactInfoKey;

END;
$$ LANGUAGE plpgsql;
