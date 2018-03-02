import { Injectable } from '@angular/core';


@Injectable()
export class AppUserConstantsService {

    public readonly STATE_LIST: Array <string> = [
        'AL', 'AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
        'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
        'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
    ];

    public readonly DYNAMIC_ZIP_REGEX: RegExp = /^\d{1,5}$/;
    public readonly PHONE_MASK: Array <string | RegExp> = [ '(', /\d/, /\d/, /\d/, ')', ' ',  /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/ ];
    public readonly TAX_ID_MASK: Array <string | RegExp> = [ /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/ ];
    public readonly DRIVERS_LICENSE_ID_MASK: Array <string | RegExp> = [ /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/ ];

    public constructor() {}
}
