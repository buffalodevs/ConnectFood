import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/router';
import { Observable } from 'rxjs/Observable';

import { GetDomainValuesService } from '../get-domain-values.service';


/**
 * A global service that is used to load App User Types before displaying certain components or pages.
 */
@Injectable()
export class AppUserTypesService implements Resolve<string[]> {

    public constructor (
        private getDomainValuesService: GetDomainValuesService
    ) {}


    /**
     * Retrieves App User types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of App User type strings.
     */
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string[]> {
        return this.getAppUserTypes();
    }


    /**
     * Retrieves App User types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of App User type strings.
     */
    public getAppUserTypes(): Observable<string[]> {
        return this.getDomainValuesService.getDomainValues('AppUserType');
    }
};
