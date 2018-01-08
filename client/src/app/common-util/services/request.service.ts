import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/of';

import { SessionDataService } from "./session-data.service";
import { LoginComponent } from '../../app-user/login/login.component'

import { FoodWebResponse } from "../../../../../shared/message-protocol/food-web-response";


/**
 * All requests made to the server should be processed through this service. There should be no raw http requests.
 * This service acts as client side middleware that checks the error state of the response to see if it can remedy the error
 * (like in cases where a login is required) and resend the request.
 */
@Injectable()
export class RequestService {

    public constructor (
        private http: HttpClient,
        private sessionDataService: SessionDataService,
        private dialog: MatDialog
    ) {}


    /**
     * Performs an HTTP POST Request. The result will be examined to determine if the user needs to re-login.
     * If so, then it will automatically trigger the Login Component (popup) to display. If the login is successful,
     * then it will resend the request. If not, then it will fail with appropriate error flag and message.
     * @param url The destination URL for the request. Can be a relative URL.
     * @param body The body or payload of the request. This will be sent in JSON format.
     */
    public post(url: string, body: any): Observable<FoodWebResponse> {

        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        const postObservable: Observable<FoodWebResponse> = this.http.post<FoodWebResponse>(url, body, options);
        
        return postObservable.mergeMap((foodWebResponse: FoodWebResponse) => {
            return this.handleResponse(postObservable, foodWebResponse);
        });
    }


    /**
     * Performs an HTTP GET Request. The result will be examined to determine if the user needs to re-login.
     * If so, then it will automatically trigger the Login Component (popup) to display. If the login is successful,
     * then it will resend the request. If not, then it will fail with appropriate error flag and message.
     * @param url The destination URL for the request. Can be a relative URL.
     */
    public get(url: string): Observable<FoodWebResponse> {

        const getObservable: Observable<FoodWebResponse> = this.http.get<FoodWebResponse>(url);

        return getObservable.mergeMap((foodWebResponse: FoodWebResponse) => {
            return this.handleResponse(getObservable, foodWebResponse);
        });
    }


    /**
     * Handles the response of either an HTTP POST or GET request.
     * If login is required (due to session termination), then generates the login dialog, waits for dialog to submit or close, and resends the request.
     * @param getOrPostObservable The original observable of the GET or POST request.
     * @param foodWebResponse The response of either an HTTP POST or GET request. In the format of the message JSON body.
     */
    private handleResponse(getOrPostObservable: Observable<FoodWebResponse>, foodWebResponse: FoodWebResponse): Observable<FoodWebResponse> {

        if (foodWebResponse.signupConfirmRequired) {
            alert('Sorry, you must confirm your registration by following the email confirmation link sent to your email account before performing this action.');
        }
        else if (foodWebResponse.loginRequired) {

            this.sessionDataService.clearSessionData(); // Mark the session ended (not logged in) in this client.

            // Attempt login (convert result promise to observable since we are chaining observables here).
            return LoginComponent.display(this.dialog).mergeMap(() => {

                // If login successful, then re-send original request and go through this process recursively. Else, return original error response.
                return this.sessionDataService.sessionDataAvailable() ? getOrPostObservable.retry()
                                                                      : Observable.of(foodWebResponse);
            });
        }

        // Either error not related to login encoutnered, or no error encountered.
        return Observable.of(foodWebResponse);
    }


    /**
     * A generic response mapping to basic boolean result.
     * @param foodWebResponse The response received from the server. In the form of the JSON body of the response.
     * @return If the related operation on the server was successful, then true.
     *         If it was unsuccessful, and due to a resolvable error (such as required login), then false.
     *         If it was unsuccessful, and due to a fatal error, then an Error is thrown.
     */
    public genericResponseMap(foodWebResponse: FoodWebResponse): boolean {

        console.log(foodWebResponse.message);
        
        // On failure.
        if (!foodWebResponse.success) {

            // Is it a non-fatal failure?
            if (foodWebResponse.loginRequired || foodWebResponse.signupConfirmRequired) {
                return false;
            }
            // It is a fatal failure.
            throw new Error(foodWebResponse.message);
        }

        // Successful.
        return true;
    }
}
