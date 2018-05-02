import * as moment from 'moment';
import { DESERIALIZER } from "./../deserialization/deserialization";
import { queryGetFoodListings } from '../common-user/get-food-listings';
import { QueryResult } from '../database-util/connection-pool';
import { sendSMS } from '../email-sms/sms';
import { sendEmail, EmailConfig } from '../email-sms/email';
import { logger } from '../logging/logger';

import { ObjectManipulation } from "../../../shared/src/common-util/object-manipulation";
import { DateFormatter } from '../../../shared/src/date-time-util/date-formatter';
import { AppUserType } from '../../../shared/src/app-user/app-user';
import { FoodListing, FoodListingsStatus } from "../../../shared/src/common-user/food-listing";
import { FoodListingFilters } from "../../../shared/src/common-user/food-listing-filters";


export const DELIVERY_REMINDER_INTERVAL_HOURS: number = 1;
const DATE_FORMATTER: DateFormatter = new DateFormatter();


export async function extractAndSendDeliveryReminders(): Promise <void> {

    logger.info('Sending scheduled delivery reminders at time: ' + new Date());

    const queryResult: QueryResult = await extractFoodListingsScheduledWithin(DELIVERY_REMINDER_INTERVAL_HOURS);
    await sendDeliveryReminders(queryResult, DELIVERY_REMINDER_INTERVAL_HOURS);
}


async function extractFoodListingsScheduledWithin(hours: number): Promise <QueryResult> {

    // Initialize Food Listing retrieval filters to have all null filter values except for the scheduleDeliveryBefore filter.
    let filters: FoodListingFilters = new FoodListingFilters();
    filters = ObjectManipulation.nullifyShallowMembers(filters); // Remove default shared filters for client search.
    filters.scheduledDeliveryBefore = moment(new Date()).add(hours, 'hours').toDate();

    return await queryGetFoodListings(filters, null, null);
}


async function sendDeliveryReminders(queryResult: QueryResult, reminderHours: number): Promise <void> {

    for (let i: number = 0; i < queryResult.rows.length; i++) {

        let foodListing: FoodListing = queryResult.rows[i].foodlisting;
        foodListing = DESERIALIZER.deserialize(foodListing, FoodListing);
        const scheduledStartTimeStr: string = DATE_FORMATTER.dateToDateTimeString(foodListing.claimInfo.deliveryInfo.deliveryStateInfo.scheduledStartTime);
        const delivererEmail: string = foodListing.claimInfo.deliveryInfo.delivererInfo.email;
        const delivererPhone: string = foodListing.claimInfo.deliveryInfo.delivererInfo.contactInfo.phone;
        
        const msgString: string = ( 'This is your ' + reminderHours + ' hour reminder concerning your delivery of ' + foodListing.foodTitle + ' at ' + scheduledStartTimeStr );

        try {

            await sendEmail(new EmailConfig (
                'Delivery Reminder for ' + foodListing.foodTitle,
                foodListing.getDelivererName(),
                delivererEmail,
                AppUserType.Deliverer,
                msgString
            ));
            await sendSMS(msgString, delivererPhone);
        }
        catch (err) {
            logger.error('Failed to send Email and/or SMS message for delivery reminder.');
        }
    }
}
