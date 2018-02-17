import { chai, should, expect } from '../../test-server';
import { FoodListing } from "../../../../shared/src/common-receiver-donor-deliverer/food-listing";


/**
 * Performs a shallow validation of a Food Listing. Only validates direct members of Food Listing.
 * Excludes members: foodListingKey, imgUrls, claimInfo, donorAppUser.
 * @param toValidate The Food Listing to validate.
 * @param validateAgainst The Food Listing to validate against.
 */
export function shallowValidateFoodListing(toValidate: FoodListing, validateAgainst: FoodListing): void {

    expect(toValidate.foodTitle).to.equal(validateAgainst.foodTitle);
    expect(toValidate.foodTypes).to.have.length(validateAgainst.foodTypes.length);
    expect(toValidate.foodTypes).to.include.members(validateAgainst.foodTypes);
    expect(toValidate.foodDescription).to.equal(validateAgainst.foodDescription);
    expect(toValidate.estimatedValue).to.equal(validateAgainst.estimatedValue);
    expect(toValidate.estimatedWeight).to.equal(validateAgainst.estimatedWeight);
    expect(toValidate.needsRefrigeration).to.equal(validateAgainst.needsRefrigeration);
    expect(toValidate.availableUntilDate).to.equal(validateAgainst.availableUntilDate);

    expect(toValidate.foodListingAvailability).to.have.length(validateAgainst.foodListingAvailability.length);
    for (let i: number = 0; i < validateAgainst.foodListingAvailability.length; i++) {
        expect(toValidate.foodListingAvailability[i].startTime.toISOString()).to.equal(validateAgainst.foodListingAvailability[i].startTime.toISOString());
        expect(toValidate.foodListingAvailability[i].endTime.toISOString()).to.equal(validateAgainst.foodListingAvailability[i].endTime.toISOString());
    }
}
