import { GPSCoordinate, DriveDistTime, getDrivingDistTime } from "../../geocode/geocode";
import { FoodListing } from "../../common-receiver-donor-deliverer/food-listing";


/**
 * Gets the full delivery trip's driving distances and times  for segments from Deliverer origin to Donor and from Donor to Receiver.
 * Fills in the distance and time information in each Delivery Food Listing provided to this function.
 * @param deliveries The deliveries that have been retreived but have not yet had distance information filled in yet.
 * @param myGPSCoordinate The GPS Coordinate of the logged in user (deliverer).
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @param receivergpscoordinates The GPS Coordinates of the receivers.
 * @return A promise that resolves to the Delivery Food Listings array that was passed in with filled in distance data.
 */
export async function fillFullTripDrivingDistances(deliveries: FoodListing[], myGPSCoordinate: GPSCoordinate): Promise <FoodListing[]>
{
    const donorGPSCoordinates: Array<GPSCoordinate> = new Array<GPSCoordinate>();
    const receiverGPSCoordinates: Array<GPSCoordinate> = new Array<GPSCoordinate>();

    // First, extract a list of Donor & Receiver GPS Coordinates from deliveries (Food Listings) results.
    for (let i: number = 0; i < deliveries.length; i++) {
        donorGPSCoordinates.push(deliveries[i].donorInfo.contactInfo.gpsCoordinate);
        receiverGPSCoordinates.push(deliveries[i].claimInfo.receiverInfo.contactInfo.gpsCoordinate);
    }

    // Next calculate and store Deliverer to Donor and Donor to Receiver driving distances & times.
    // NOTE: The two calls involve synchronous promises, but we can combine them to be asynchronous if we have performance issue here.
    deliveries = await fillDrivingDistTimeToDonors(deliveries, myGPSCoordinate, donorGPSCoordinates);
    return fillDrivingDistTimeFromDonorsToReceivers(deliveries, donorGPSCoordinates, receiverGPSCoordinates);
}


/**
 * Gets the driving distances from the Deliverer origin to each Donor.
 * Fills in the distance information in each Delivery Food Listing provided to this function.
 * @param deliveries The Deliveries that have been retreived but have not yet had distance information filled in yet.
 * @param myGPSCoordinate The GPS Coordinate of the logged in user (deliverer).
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @return A promise that resolves to the Delivery Food Listings array that was passed in, but with added filled in to-donor distance data.
 */
async function fillDrivingDistTimeToDonors(deliveries: FoodListing[], myGPSCoordinate: GPSCoordinate, donorGPSCoordinates: GPSCoordinate[]): Promise <FoodListing[]> {

    const driveDistTime: DriveDistTime[] = await getDrivingDistTime(myGPSCoordinate, donorGPSCoordinates);

    for (let i: number = 0; i < driveDistTime.length; i++) {
        deliveries[i].donorInfo.contactInfo.drivingDistance = driveDistTime[i].driveDistanceMi;
        deliveries[i].donorInfo.contactInfo.drivingTime = driveDistTime[i].driveDurationMin;
    }

    return deliveries;
}


/**
 * Gets the driving distances and times from the Donors to corresponding Receivers (Donor-Receiver pairs).
 * Fills in the distance and time information in each Delivery Food Listing provided to this function.
 * @param deliveries The Deliveries that have been retreived but have not yet had donor to receiver distance information filled in yet.
 * @param donorGPSCoordinates The GPS Coordinates of the donors.
 * @param receiverGPSCoordinates The GPS Coordinates of the receivers.
 * @param index Should not be provided by external call to this function!!! Used to keep track of index in recursvie function calls (internally ONLY)!
 * @return A promise that resolves to the Delivery Food Listings array that was passed in, but with added filled in donor-to-receiver distance data.
 */
async function fillDrivingDistTimeFromDonorsToReceivers(deliveries: FoodListing[], donorGPSCoordinates: GPSCoordinate[],
                                                        receiverGPSCoordinates: GPSCoordinate[]): Promise <FoodListing[]>
{
    let driveDistTimePromises: Promise <DriveDistTime[]>[] = [];

    // Generate all promises for getting distances between each donor and receiver pair.
    for (let i: number = 0; i < deliveries.length; i++) {
        driveDistTimePromises.push(getDrivingDistTime(donorGPSCoordinates[i], [receiverGPSCoordinates[i]]));
    }

    // Wait for all promises to resolve.
    const driveDistTimes: DriveDistTime[][] = await Promise.all(driveDistTimePromises);

    // Handle results of all promises.
    for (let i: number = 0; i < driveDistTimes.length; i++) {
        deliveries[i].claimInfo.receiverInfo.contactInfo.drivingDistance = driveDistTimes[i][0].driveDistanceMi;
        deliveries[i].claimInfo.receiverInfo.contactInfo.drivingTime = driveDistTimes[i][0].driveDurationMin;
    }

    return deliveries;
}
