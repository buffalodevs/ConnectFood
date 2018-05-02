import { chai, server, should, expect, loginTestUser } from '../test-server';
import { validateGenericFoodWebResponse } from "../util/test-util";
import { VALID_DONATION_FOOD_LISTING } from './util/food-listing-sample-data';
import { shallowValidateFoodListing } from '../common-user/util/validate-food-listing';

import { FoodListing, AddFoodListingRequest, AddFoodListingResponse } from '../../../shared/src/donor/message/add-food-listing-message';
import { GetFoodListingsRequest, FoodListingFilters, GetFoodListingsResponse } from '../../../shared/src/common-user/message/get-food-listings-message';


const ADD_ROUTE: string = '/donor/addFoodListing';
const GET_ROUTE: string = '/commonUser/getFoodListings';
let recentlyAddedFoodListingKey: number = null;


/**
 * The describe function takes as its first argument the description of a testing suite. This can be an arbitrary value.
 * The second argument is a function that contains the actual test suite.
 * Each it function call within the testing suite should contain an individual test. Each individual test consists of sending a request to the server.
 * You can add tests to this suite and add other testing suites.
 */
describe('Add Food Listing Test', () => {

    it('Add Food Listing should succeed when given correct Food Listing donation data (no image)', testAddFoodListingNoImg.bind(this, VALID_DONATION_FOOD_LISTING, true));
    it('Directly Get Food Listing (via foodListingKey) sholuld succeed', testGetAddedFoodListing.bind(this, VALID_DONATION_FOOD_LISTING, true));
});


/**
 * Tests the Add Food Listing (Donate) server operation.
 * @param foodListing The Food Listing to add.
 * @param shouldSucceed Set to true if the operation is expected to succeed. Otherwise, set false if it is expected to fail.
 * @param done Mocha done callback function that will be invoked after the test.
 */
function testAddFoodListingNoImg(foodListing: FoodListing, shouldSucceed: boolean, done: MochaDone): void {

    const addFoodListingRequest: AddFoodListingRequest = new AddFoodListingRequest(foodListing);

    loginTestUser().then(() => {
        chai.request.agent(server)
            .post(ADD_ROUTE)
            .send(addFoodListingRequest)
            .end(validateAddFoodListingResponse.bind(this, done, shouldSucceed));
    });
}


function validateAddFoodListingResponse(done: MochaDone, shouldSucceed: boolean, err: any, response: ChaiHttp.Response): void {

    const addFoodListingResponse: AddFoodListingResponse = response.body;

    validateGenericFoodWebResponse(ADD_ROUTE, shouldSucceed, null, null, err, response);

    addFoodListingResponse.should.have.property('foodListingKey');
    if (shouldSucceed) {
        expect(addFoodListingResponse.foodListingKey).to.not.equal(null);
    }
    else {
        expect(addFoodListingResponse.foodListingKey).to.equal(null);
    }

    recentlyAddedFoodListingKey = addFoodListingResponse.foodListingKey;
    done();
}


/**
 * Tests the (direct using foodListingKey) Get Food Listing operation on the recently added Food Listing.
 * @param foodListing The Food Listing to add.
 * @param shouldSucceed Set to true if the operation is expected to succeed. Otherwise, set false if it is expected to fail.
 * @param done Mocha done callback function that will be invoked after the test.
 */
function testGetAddedFoodListing(foodListing: FoodListing, shouldSucceed: boolean, done: MochaDone): void {

    const foodListingFilters: FoodListingFilters = new FoodListingFilters();
    foodListingFilters.foodListingKey = recentlyAddedFoodListingKey;

    const loginRequest: GetFoodListingsRequest = new GetFoodListingsRequest(foodListingFilters);

    loginTestUser().then(() => {
        chai.request.agent(server)
            .post(GET_ROUTE)
            .send(loginRequest)
            .end(validateGetAddedFoodListingResponse.bind(this, done, shouldSucceed));
    });
}


function validateGetAddedFoodListingResponse(done: MochaDone, shouldSucceed: boolean, err: any, response: ChaiHttp.Response): void {

    const getFoodListingResponse: GetFoodListingsResponse = response.body;

    validateGenericFoodWebResponse(GET_ROUTE, shouldSucceed, null, null, err, response);

    getFoodListingResponse.should.have.property('listData');
    if (shouldSucceed) {
        expect(getFoodListingResponse.listData).to.not.equal(null);
        expect(getFoodListingResponse.listData).to.have.length(1);
        shallowValidateFoodListing(getFoodListingResponse.listData[0], VALID_DONATION_FOOD_LISTING);
    }
    else {
        expect(getFoodListingResponse.listData).to.equal(null);
    }

    done();
}
