import * as _ from 'lodash';
import { AppUser, Organization, DateRange, AppUserType, ContactInfo, GPSCoordinate } from '../../../../shared/src/app-user/app-user';

export { AppUser };


/**
 * App User instance that can be used for a valid signup operation.
 */
export const VALID_APP_USER: AppUser = new AppUser (
    'marknemmer@gmail.com',
    AppUserType.Donor,
    'Nemmer',
    'Mark',
    new ContactInfo (
        '66 Berkley Rd.',
        'Williamsville',
        'NY',
        14221,
        new GPSCoordinate(),
        new Date().getTimezoneOffset(),
        '(716) 222-2222'
    ),
    new Organization (
        'Mark Nemm Corp',
        '12-1212121'
    ),
    [
        new DateRange (
            new Date('11/12/2017 10:00 AM'),
            new Date('11/12/2017 10:00 PM')
        )
    ]
);


/**
 * App User instance that can be used to simulate an invalid email error during signup.
 */
export const INVALID_EMAIL_APP_USER: AppUser = _.cloneDeep(VALID_APP_USER);
INVALID_EMAIL_APP_USER.email = 'invalid_email';
