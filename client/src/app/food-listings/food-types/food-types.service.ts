import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router/router';
import { Observable } from 'rxjs/Observable';

import { GetDomainValuesService } from '../../common-util/services/get-domain-values.service';


/**
 * A global service that is used to load Food Types before displaying certain components or pages.
 */
@Injectable()
export class FoodTypesService implements Resolve<string[]> {

    public constructor (
        private getDomainValuesService: GetDomainValuesService
    ) {}


    /**
     * Retrieves food types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of food type strings.
     */
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string[]> {
        return this.getFoodTypes();
    }


    /**
     * Retrieves food types from the server if they have not previously been retrieved. Otherwise, fetches them from contained cache.
     * @return An observable object that resolves to an array of food type strings.
     */
    public getFoodTypes(): Observable<string[]> {
        return this.getDomainValuesService.getDomainValues('FoodType');
    }

    
    /**
     * Examines an object with Food Type keys and boolean values and extracts the Food Types that are associated with true.
     * @param foodTypeBooleans An object that contains Food Type keys associated with boolean values.
     */
    public getFoodTypesAssocWithTrue(foodTypeBooleans: object): string[] {

        let foodTypesAssocWithTrue: string[] = [];
        let allFoodTypes: string[] = Object.keys(foodTypeBooleans);

        // Iterate through all the food types and add those that are associated w/ true to the return list.
        for (let i: number = 0; i < allFoodTypes.length; i++) {
            if (foodTypeBooleans[allFoodTypes[i]] === true) {
                foodTypesAssocWithTrue.push(allFoodTypes[i]);
            }
        }

        return foodTypesAssocWithTrue;
    }
};
