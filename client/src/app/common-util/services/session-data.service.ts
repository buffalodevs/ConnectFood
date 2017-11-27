import { Injectable } from '@angular/core';

import { AppUserInfo } from "./../../../../../shared/app-user/app-user-info";
import { StringManipulation } from '../../../../../shared/common-util/string-manipulation';
import { TimeRange } from '../../../../../shared/app-user/time-range';


@Injectable()
export class SessionDataService {

    /**
     * Raw client session data. The App User Info belonging to the current signed in user.
     */
    private static appUserInfo: AppUserInfo = null;


    public constructor() {}


    /**
     * Updates the client's session data based off of given App User info.
     * @param appUserInfo The App User info to update the client session data with.
     */
    public updateAppUserSessionData(appUserInfo: AppUserInfo): void {
        SessionDataService.appUserInfo = appUserInfo;
    }


    /**
     * Fills and returns an AppUserInfo container with available client session data.
     * @return The filled AppUserInfo container.
     */
    public getAppUserSessionData(): AppUserInfo {
        return SessionDataService.appUserInfo;
    }


    /**
     * Clears the current session data.
     */
    public clearSessionData(): void {
        SessionDataService.appUserInfo = null;
    }


    /**
     * Determines if any session data is currently available or being held.
     * @return true if session data is available, false if not (it is clear).
     */
    public sessionDataAvailable(): boolean {
        return ( SessionDataService.appUserInfo != null );
    }
}
