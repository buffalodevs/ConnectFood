import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { RequestService } from './request.service';
import { SessionDataService } from './session-data.service';
import { LoginComponent } from '../../app-user/login/login.component'

import { LoginResponse } from './../../../../../shared/src/app-user/message/login-message';


/**
 * Contains route preprocessing logic. Re-authenticates the user whenever there is a route change.
 * Also, makes a user login if they visit restricted routes which require login.
 */
@Injectable()
export class RoutePreprocessService implements CanActivate {


    /**
     * List of login restricted routes. User must be logged in to visit these pages!
     */
    private static readonly _LOGIN_RESTRICTED_ROUTES: string[] = ['/donate', '/receive', '/deliver', '/foodListingCart', 'deliveryCart', '/appUserInfo'];


    public constructor (
        private _requestService: RequestService,
        private _router: Router,
        private _authSessionService: SessionDataService,
        private _dialog: MatDialog
    ) { }


    /**
     * Determines if a given target route can be activated (or followed). Will check credentials on server regardless of whether or not
     * the given route is in the LOGIN_RESTRICTED_ROUTES list.
     * @param route The route that is being activated.
     * @param state The state of the router.
     * @return An observable that will resolve to true if the route can be activated, and false if it cannot.
     */
    public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable <boolean> {

        // Check with server to check if we are logged in!
        let observer: Observable <LoginResponse> = <Observable <LoginResponse>>this._requestService.get('/appUser/reAuthenticate')

        // Finally, check the response from the server and react appropriately.
        return observer.map((reAuthenticateResponse: LoginResponse): boolean => {

                // Make sure we update the session info we are holding.
                this._authSessionService.updateAppUserSessionData(reAuthenticateResponse.appUser);

                // If not authenticated, and we are visiting a route that requires us to be logged in, then redirect to login.
                if (!reAuthenticateResponse.success && RoutePreprocessService._LOGIN_RESTRICTED_ROUTES.indexOf(state.url) >= 0) {
                    this.attemptLoginAndRedirect(state.url);
                    return false;
                }

                return true;
        });
    }


    /**
     * Generates a login dialog that the user can login with. If login is successful, then the user is redirected to their original target route.
     * @param toUrl THe url that the user was trying to access before reAuthentication.
     */
    private attemptLoginAndRedirect(toUrl: string): void {

        // Generate the login dialog.
        let dialogObservable: Observable<any> = LoginComponent.display(this._dialog);

        // Observe what the dialog result is.
        dialogObservable.subscribe(() => {
            
            // After done with login dialog, if we are logged in, then we can redirect to original intended link!
            if (this._authSessionService.sessionDataAvailable()) {
                this._router.navigate([toUrl]);
            }
            // Otherwise, simply navigate to page that notifies user that login is required.
            else {
                this._router.navigate(['/loginRequired']);
            }
        });
    }
}
