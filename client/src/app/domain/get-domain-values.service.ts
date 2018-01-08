import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';

import { RequestService } from "../common-util/services/request.service";

import { GetDomainValuesResponse, GetDomainValuesRequest } from '../../../../shared/domain/get-domain-values-message';


@Injectable()
export class GetDomainValuesService {

    /**
     * Static cache that contains as keys the domain names, and values the domain vlaues.
     * Will persist until the user leaves the website (closes tab or browser).
     */
    private static domainValueCache: Map<string, string[]> = new Map<string, string[]>();

    public constructor (
        private requestService: RequestService
    ) { }


    /**
     * Gets domain values for a given domain. Will store retrieved values in cache and retrieve values from cache if possible.
     * @param domainName The name of the domain to get the values of.
     * @param useCache (Optional) Default is true. Set to false if the cache should be ignored and values should be gotten fresh from the server.
     * @return An observable that resolves to the list of domain values (strings).
     */
    public getDomainValues(domainName: string, useCache: boolean = true): Observable<string[]> {

        useCache = useCache && GetDomainValuesService.domainValueCache.has(domainName);
        
        // If we have cached Domain Values (we have no need of contacting the server).
        if (useCache) {
            return Observable.of(GetDomainValuesService.domainValueCache.get(domainName));
        }
        
        // Else we do not have cached Domain Values, or we should not use the cache, then we will contact the server.
        let observer: Observable<GetDomainValuesResponse> = this.requestService.post('/domain/getDomainValues', new GetDomainValuesRequest(domainName));
        
        return observer.map((getDomainValuesResponse: GetDomainValuesResponse) => {
            return this.extractDomainsFromResponse(getDomainValuesResponse, domainName);
        });
    }


    /**
     * Extracts the domain values from the server response message.
     * @param getDomainValuesResponse The response message.
     * @param domainName The name of the domain that the values belong to.
     * @return A list of the extracted domain values.
     */
    private extractDomainsFromResponse(getDomainValuesResponse: GetDomainValuesResponse, domainName: string): string[] {

        console.log(getDomainValuesResponse.message);

        if (getDomainValuesResponse.success) {
            
            // Fill cache with domain values retrieved for the given domain name.
            GetDomainValuesService.domainValueCache.set(domainName, getDomainValuesResponse.domainValues);
            return getDomainValuesResponse.domainValues;
        }

        throw new Error(getDomainValuesResponse.message);
    }
}
