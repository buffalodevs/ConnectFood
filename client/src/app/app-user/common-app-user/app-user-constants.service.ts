import { Injectable } from '@angular/core';


@Injectable()
export class AppUserConstantsService {

    public readonly STATE_LIST: Array <string>;
    public readonly DYNAMIC_ZIP_REGEX: RegExp;
    public readonly PHONE_MASK: Array <string | RegExp>;
    public readonly TAX_ID_MASK: Array <string | RegExp>;

    public constructor() {

        this.STATE_LIST = [
            'AL', 'AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
            'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
            'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
        ];

        this.DYNAMIC_ZIP_REGEX = /^\d{1,5}$/;

        this.PHONE_MASK = [ '(', /\d/, /\d/, /\d/, ')', ' ',  /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/ ];
        this.TAX_ID_MASK = [ /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/ ];
    }
}
