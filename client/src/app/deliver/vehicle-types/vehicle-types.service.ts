import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/router';
import { Observable } from 'rxjs/Observable';

import { GetDomainValuesService } from '../../common-util/services/get-domain-values.service';


/**
 * A global service that is used to load Vehicle Types before displaying certain components or pages.
 */
@Injectable()
export class VehicleTypesService implements Resolve<string[]> {

    public constructor (
        private getDomainValuesService: GetDomainValuesService
    ) {}


    /**
     * Retrieves vehicle types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of vehicle type strings.
     */
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string[]> {
        return this.getVehicleTypes();
    }


    /**
     * Retrieves vehicle types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of vehicle type strings.
     */
    public getVehicleTypes(): Observable<string[]> {
        return this.getDomainValuesService.getDomainValues('VehicleType');
    }
};
