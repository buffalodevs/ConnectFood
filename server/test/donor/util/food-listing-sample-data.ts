import { FoodListing } from "../../../../shared/src/common-user/food-listing";
import { FoodType, FoodListingFilters } from "../../../../shared/src/common-user/food-listing-filters";
import { VehicleType } from "../../../../shared/src/common-user/food-listing-domain/vehicle-type";
import { DateRange } from "../../../../shared/src/app-user/app-user";


export const VALID_DONATION_FOOD_LISTING: FoodListing = new FoodListing (
    null,
    'Test Food Title 777666',
    [
        FoodType.cannedGood
    ],
    'Some test food.',
    false,
    new Date('12/25/2025'),
    null,
    5,
    20.5,
    VehicleType.sedan,
    null,
    [
        // Now -> 2 hours later.
        new DateRange(new Date(), new Date(new Date().valueOf() + 120000))
    ],
    null
);
