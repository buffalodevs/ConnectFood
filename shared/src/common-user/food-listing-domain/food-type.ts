import { EnumManipulation } from "../../common-util/enum-manipulation";


/**
 * The food types/categories that a food listing can be a part of.
 */
export enum FoodType {
    produce     = 'Produce',
    cannedGood  = 'Canned Good',
    dessert     = 'Dessert',
    frozen      = 'Frozen',
    grain       = 'Grain',
    dairy       = 'Dairy',
    meat        = 'Meat',
    seaFood     = 'Sea Food',
    bakedGood   = 'Baked Good',
    beverage    = 'Beverage',
    snack       = 'Snack',
    meal        = 'Meal'
}


export const FOOD_TYPE_VALUES: string[] = EnumManipulation.getEnumValues(FoodType);
