import { Injectable } from '@angular/core';

import { AppUserType } from '../../../../shared/app-user/app-user-info';


@Injectable()
export class AppUserConstantsService {

    public readonly STATE_LIST: string[];
    public readonly APP_USER_TYPE_KEYS: string[];
    public readonly APP_USER_TYPE_VALS: AppUserType[];
    public readonly DYNAMIC_ZIP_REGEX: RegExp;
    public readonly DYNAMIC_PHONE_3DIGITS: RegExp;
    public readonly DYNAMIC_PHONE_4DIGITS: RegExp;

    public constructor() {

        this.STATE_LIST = [
            'AL', 'AK', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
            'HI', 'ID', 'IA', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD',
            'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH',
            'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
            'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY'
        ];

        // Convert enum to array so that the enum values are iterable in a template.
        let appUserTypesTemp: any[] = Object.keys(AppUserType).map((type) => {
            return AppUserType[type];
        });

        this.APP_USER_TYPE_KEYS = appUserTypesTemp.slice(0, appUserTypesTemp.length / 2);
        this.APP_USER_TYPE_VALS = appUserTypesTemp.slice(appUserTypesTemp.length / 2);

        this.DYNAMIC_ZIP_REGEX = /^\d{1,5}$/;

        this.DYNAMIC_PHONE_3DIGITS = /^\d{1,3}$/;
        this.DYNAMIC_PHONE_4DIGITS = /^\d{1,4}$/;
    }
}
