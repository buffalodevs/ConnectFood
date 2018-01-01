import { Injectable } from '@angular/core';

import { AppUserInfo, TimeRange } from "./../../../../../shared/app-user/app-user-info";
import { StringManipulation } from '../../../../../shared/common-util/string-manipulation';


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

        if (appUserInfo != null) {
            this.ensureAvailabilityContainsDates(appUserInfo);
        }

        SessionDataService.appUserInfo = appUserInfo;
    }


    /**
     * Ensures that the availability member of appUserInfo (if not null) contains dates in the Time Ranges (not JSON ISO date strings).
     * If it contains JSON ISO date strings, then it converts them to dates.
     * @param appUserInfo The appUserInfo object to check the availability member of.
     *                    NOTE: This may be internally modified!
     */
    private ensureAvailabilityContainsDates(appUserInfo: AppUserInfo): void {

        if (appUserInfo.availability === null)  return;

        for (let i: number = 0; i < appUserInfo.availability.length; i++) {
            // Constructor for TimeRange automatically does conversion from JSON string to date if necessary!
            appUserInfo.availability[i] = new TimeRange(appUserInfo.availability[i].startTime, appUserInfo.availability[i].endTime);
        }
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
