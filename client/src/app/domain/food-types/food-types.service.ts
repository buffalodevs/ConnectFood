import { Injectable } from '@angular/core';


/**
 * A global service that is used to load Food Types before displaying certain components or pages.
 */
@Injectable()
export class FoodTypesService {

    public constructor() {}

    
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
