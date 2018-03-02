export class AppUserErrorMsgs {
    
    public static readonly DUPLICATE_EMAIL: string = 'Account already exists with the provided email address';
    public static readonly INVALID_EMAIL: string = 'Provided email not in correct format';
    public static readonly INVALID_PASSWORD: string = 'Password must be between 6 and 20 characters';
    public static readonly INVALID_ADDRESS: string = 'Provided address could not be found';
    public static readonly INVALID_ZIP: string = 'Provided ZIP code must contain exactly 5 digits';
    public static readonly INVALID_STATE: string = 'Provided state must be a valid 2 letter state abbreviation';
    public static readonly INVALID_PHONE: string = 'Phone number must have format: (###) ###-####';
    public static readonly INVALID_TAX_ID: string = 'Provided Tax ID is not in a valid format: ##-#######';
    public static readonly INVALID_DRIVERS_LICENSE_ID: string = 'Provided Drivers License ID is not in a valid format: ### ### ###';
    public static readonly INCORRECT_CURRENT_PASSWORD: string = 'Provided current password is incorrect';
    public static readonly INCORRECT_LOGIN: string = 'Provided login information is incorrect';
}
