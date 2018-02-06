import { Injectable } from '@angular/core';
import { AppUser } from "./../../../../../shared/src/app-user/app-user";


@Injectable()
export class SessionDataService {

    /**
     * Raw client session data. The App User Info belonging to the current signed in user.
     */
    private static _appUser: AppUser = null;


    public constructor() {}


    /**
     * Updates the client's session data based off of given App User info.
     * @param appUser The App User info to update the client session data with.
     */
    public updateAppUserSessionData(appUser: AppUser): void {
        SessionDataService._appUser = appUser;
    }


    /**
     * Fills and returns an AppUser container with available client session data.
     * @return The filled AppUser container.
     */
    public getAppUserSessionData(): AppUser {
        return SessionDataService._appUser;
    }


    /**
     * Clears the current session data.
     */
    public clearSessionData(): void {
        SessionDataService._appUser = null;
    }


    /**
     * Determines if any session data is currently available or being held.
     * @return true if session data is available, false if not (it is clear).
     */
    public sessionDataAvailable(): boolean {
        return ( SessionDataService._appUser != null );
    }
}
