import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/retry';
import 'rxjs/add/observable/of';

import { SessionDataService } from "./session-data.service";
import { DeserializerService } from './deserializer.service';
import { RequestResponseLoggerService } from '../../common-util/services/logging/request-response-logger.service';
import { LoginComponent } from '../../app-user/login/login.component'

import { FoodWebResponse } from "../../../../../shared/src/message-protocol/food-web-response";


/**
 * All requests made to the server should be processed through this service. There should be no raw http requests.
 * This service acts as client side middleware that checks the error state of the response to see if it can remedy the error
 * (like in cases where a login is required) and resend the request.
 */
@Injectable()
export class RequestService {

    public constructor (
        private _http: HttpClient,
        private _sessionDataService: SessionDataService,
        private _dialog: MatDialog,
        private _deserializer: DeserializerService,
        private _requestResponseLogger: RequestResponseLoggerService
    ) {}


    /**
     * Performs an HTTP POST Request. The result will be examined to determine if the user needs to re-login.
     * If so, then it will automatically trigger the Login Component (popup) to display. If the login is successful,
     * then it will resend the request. If not, then it will fail with appropriate error flag and message.
     * @param url The destination URL for the request. Can be a relative URL.
     * @param body The body or payload of the request. This will be sent in JSON format.
     * @param files The files that are to be attached to the request.
     */
    public post(url: string, body: any, files?: File[]): Observable <FoodWebResponse> {

        let formData: FormData = null;
        let options = {};
        
        // If we are sending JSON data, then we will set headers to application/json.
        if (files == null) {
            options['headers'] = {
                'Content-Type': 'application/json'
            }
        }
        // If we are sending multi-part form data, then we will use FormData object for post (headers are set implicitly).
        else {

            formData = new FormData();
            formData.append('dataJSON', JSON.stringify(body));
            
            for (let i: number = 0; i < files.length; i++) {
                formData.append(i.toString(), files[i], files[i].name);
            }
        }

        this._requestResponseLogger.logRequest(url, 'POST', body);
        const postObservable: Observable<FoodWebResponse> = this._http.post<FoodWebResponse>(url, (formData == null) ? body : formData, options);
        
        return postObservable.mergeMap((foodWebResponse: FoodWebResponse) => {
            return this.handleResponse(url, postObservable, foodWebResponse);
        });
    }


    /**
     * Performs an HTTP GET Request. The result will be examined to determine if the user needs to re-login.
     * If so, then it will automatically trigger the Login Component (popup) to display. If the login is successful,
     * then it will resend the request. If not, then it will fail with appropriate error flag and message.
     * @param url The destination URL for the request. Can be a relative URL.
     */
    public get(url: string): Observable <FoodWebResponse> {

        this._requestResponseLogger.logRequest(url, 'GET');
        const getObservable: Observable<FoodWebResponse> = this._http.get<FoodWebResponse>(url);

        return getObservable.mergeMap((foodWebResponse: FoodWebResponse) => {
            return this.handleResponse(url, getObservable, foodWebResponse);
        });
    }


    /**
     * Handles the response of either an HTTP POST or GET request.
     * If login is required (due to session termination), then generates the login dialog, waits for dialog to submit or close, and resends the request.
     * @param url The URL from which the response originated.
     * @param getOrPostObservable The original observable of the GET or POST request.
     * @param foodWebResponse The response of either an HTTP POST or GET request. In the format of the message JSON body.
     */
    private handleResponse(url: string, getOrPostObservable: Observable<FoodWebResponse>, foodWebResponse: FoodWebResponse): Observable <FoodWebResponse> {

        this._requestResponseLogger.logResponse(url, foodWebResponse);

        if (foodWebResponse.signupConfirmRequired) {
            alert('Sorry, you must confirm your registration by following the email confirmation link sent to your email account before performing this action.');
        }
        else if (foodWebResponse.loginRequired) {

            this._sessionDataService.clearSessionData(); // Mark the session ended (not logged in) in this client.

            // Attempt login (convert result promise to observable since we are chaining observables here).
            return LoginComponent.display(this._dialog).mergeMap(() => {

                // If login successful, then re-send original request and go through this process recursively. Else, return original error response.
                return this._sessionDataService.sessionDataAvailable() ? getOrPostObservable.retry()
                                                                       : Observable.of(foodWebResponse);
            });
        }

        // Either error not related to login encoutnered, or no error encountered (We must also try to automatically deserialize the result).
        return Observable.of(this._deserializer.deserialize(foodWebResponse));
    }


    /**
     * A generic response mapping to basic boolean result.
     * @param foodWebResponse The response received from the server. In the form of the JSON body of the response.
     * @return If the related operation on the server was successful, then nothing.
     *         If it was unsuccessful, then an Error is thrown with the error message from the server as its message content.
     */
    public genericResponseMap(foodWebResponse: FoodWebResponse): void {
        
        // On failure.
        if (!foodWebResponse.success) {
            throw new Error(foodWebResponse.message);
        }
    }
}
