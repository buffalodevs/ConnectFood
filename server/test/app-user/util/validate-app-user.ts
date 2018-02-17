import { chai, expect } from "../../test-server";
import { AppUser } from "../app-user";


/**
 * Validates a given App User by comparing it to another App User object.
 * @param toValidate The App User to validate.
 * @param validateAgainst The App User to validate against. 
 */
export function validateAppUser(toValidate: AppUser, validateAgainst: AppUser): void {

    expect(toValidate.email).to.equal(validateAgainst.email);
    expect(toValidate.firstName).to.equal(validateAgainst.firstName);
    expect(toValidate.lastName).to.equal(validateAgainst.lastName);
    expect(toValidate.appUserType).to.equal(validateAgainst.appUserType);

    expect(toValidate.organization.name).to.equal(validateAgainst.organization.name);
    expect(toValidate.organization.taxId).to.equal(validateAgainst.organization.taxId);

    expect(toValidate.contactInfo.address).to.equal(validateAgainst.contactInfo.address);
    expect(toValidate.contactInfo.city).to.equal(validateAgainst.contactInfo.city);
    expect(toValidate.contactInfo.state).to.equal(validateAgainst.contactInfo.state);
    expect(toValidate.contactInfo.zip).to.equal(validateAgainst.contactInfo.zip);
    expect(toValidate.contactInfo.phone).to.equal(validateAgainst.contactInfo.phone);
    expect(toValidate.contactInfo.utcOffsetMins).to.equal(validateAgainst.contactInfo.utcOffsetMins);

    expect(toValidate.availability).to.have.length(validateAgainst.availability.length);
    for (let i: number = 0; i < validateAgainst.availability.length; i++) {
        expect(toValidate.availability[i].startTime.toISOString()).to.equal(validateAgainst.availability[i].startTime.toISOString());
        expect(toValidate.availability[i].endTime.toISOString()).to.equal(validateAgainst.availability[i].endTime.toISOString());
    }
}
