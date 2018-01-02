import { Injectable } from '@angular/core';


@Injectable()
export class AppUserConstantsService {

    public readonly STATE_LIST: string[];
    public readonly DYNAMIC_ZIP_REGEX: RegExp;
    public readonly DYNAMIC_PHONE_3DIGITS_REGEX: RegExp;
    public readonly DYNAMIC_PHONE_4DIGITS_REGEX: RegExp;
    public readonly DYNAMIC_TAX_ID_2DIGITS_REGEX: RegExp;
    public readonly DYNAMIC_TAX_ID_7DIGITS_REGEX: RegExp;

    public constructor() {

        this.STATE_LIST = [
            'AL', 'AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
            'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
            'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
        ];

        this.DYNAMIC_ZIP_REGEX = /^\d{1,5}$/;

        this.DYNAMIC_PHONE_3DIGITS_REGEX = /^\d{1,3}$/;
        this.DYNAMIC_PHONE_4DIGITS_REGEX = /^\d{1,4}$/;

        this.DYNAMIC_TAX_ID_2DIGITS_REGEX = /^\d{1,2}$/;
        this.DYNAMIC_TAX_ID_7DIGITS_REGEX = /^\d{1,7}$/;
    }
}
