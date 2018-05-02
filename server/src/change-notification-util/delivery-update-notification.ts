import * as moment from 'moment';
import * as striptags from 'striptags'

import { SessionData, AppUser } from "../common-util/session-data";
import { DeliveryUpdateNotificationData } from './delivery-update-notification-data';
import { DriveDistTime, GPSCoordinate, getRouteSegmentDrivingDistTimes, getEstimatedArrivalTimes } from "../geocode/geocode";
import { EmailConfig, sendEmail } from "../email-sms/email";

import { DeliveryUtil, DeliveryState } from "../../../shared/src/deliverer/delivery-util";
import { AppUserType } from '../../../shared/src/app-user/app-user';
import { DateFormatter } from "../../../shared/src/date-time-util/date-formatter";
import { sendSMS } from '../email-sms/sms';

export { DeliveryUpdateNotificationData }


/**
 * Notifies both the affected receiver and donor of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotificationData Data required to notify all affected parties of the delivery state change operation.
 * @return A promise that resolves to nothing on success.
 */
export async function notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData): Promise <void> {

    // First grab estimated arrival time strings for Donor and Receiver.
    const estimatedArrivalTimes: Map <string, string> = await getEstimatedArrivalTimeStrs(delivererSessionData, deliveryUpdateNotificationData);

    // Execute both email promises together (will not need to wait for one to finish before starting next)!
    await Promise.all([
        notifyDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData, estimatedArrivalTimes.get('Donor')),
        notifyReceiverOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotificationData, estimatedArrivalTimes.get('Receiver'))
    ]);
}


/**
 * Notifies an affected donor of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotificationData Data required to notify all affected parties of the delivery state change operation.
 * @param estimatedArrivalTime The estimated time for the Deliverer to arrive at the Donor.
 *                             NOTE: Can be null if the deliverer has already picked up the delivery at the donor.
 * @return A promise that resolves to nothing on success.
 */
async function notifyDonorOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                           estimatedArrivalTime: string): Promise <void>
{
    await generateAndSendEmailAndSMS(delivererSessionData, deliveryUpdateNotificationData, AppUserType.Donor, estimatedArrivalTime);
}


/**
 * Notifies an affected receiver of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotificationData Data required to notify all affected parties of the delivery state change operation.
 * @param estimatedArrivalTime The estimated time for the Deliverer to arrive at the Donor.
 * @return A promise that resolves to nothing on success.
 */
async function notifyReceiverOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                        estimatedArrivalTime: string): Promise <void>
{
    await generateAndSendEmailAndSMS(delivererSessionData, deliveryUpdateNotificationData, AppUserType.Receiver, estimatedArrivalTime);
}


/**
 * Generates and sends an email message notifying a given user that a Delivery has changed state or was cancelled.
 * @param delivererSessionData The session data pertaining to the deliverer.
 * @param deliveryUpdateNotificationData The update notification data used to generate the message.
 * @param appUserType The type of the user (Receiver or Donor) that the message is being sent to.
 * @param estimatedArrivalTime The estimated time for the Deliverer to arrive at the Donor or Receiver.
 *                             NOTE: Can be null for Donor if delivery has already been picked up.
 */
async function generateAndSendEmailAndSMS(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                          appUserType: AppUserType, estimatedArrivalTime: string): Promise <void>
{
    const htmlBodyMid: string = generateHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData, appUserType, estimatedArrivalTime);

    // Are we targeting the Donor or Receiver?
    const targetUser: AppUser = (appUserType === AppUserType.Receiver) ? deliveryUpdateNotificationData.receiverSessionData.appUser
                                                                       : deliveryUpdateNotificationData.donorSessionData.appUser;

    // Generate our mail configuration for sending the update notification email (includes options and payload data).
    const emailConfig: EmailConfig = new EmailConfig (
        deliveryUpdateNotificationData.foodTitle + ' Update Notification',
        targetUser.organization.name,
        targetUser.email,
        appUserType,
        ( generateHTMLBodyStart(delivererSessionData, deliveryUpdateNotificationData) + htmlBodyMid )
    );

    // Send the email with our generated mail configuration. Also, send SMS (text) message without HTML tags.
    try {
        await sendEmail(emailConfig);
        await sendSMS(emailConfig.contentHTMLStr, targetUser.contactInfo.phone, true);
    }
    catch (err) {
        throw new Error('Failed to Email/SMS notification of delivery update to concerned donor and receiver');
    }
}


/**
 * Generates the starting contents of the email message body.
 * @param delivererSessionData The user information pertaining to the deliverer.
 * @param deliveryUpdateNotificationData The update notification data used to generate the message subject.
 * @return The starting body contents.
 */
function generateHTMLBodyStart(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData): string {

    const foodTitle: string = deliveryUpdateNotificationData.foodTitle;
    const delivererName: string = ( delivererSessionData.appUser.firstName + ' ' + delivererSessionData.appUser.lastName );
    const readableDeliveryState: string = DeliveryUtil.getReadableDeliveryState(deliveryUpdateNotificationData.newDeliveryState);

    const stateReverted: boolean = ( DeliveryUtil.compareDeliveryStates(deliveryUpdateNotificationData.newDeliveryState, deliveryUpdateNotificationData.oldDeliveryState) < 0 );
    const enterOrRevertStr: string = stateReverted ? 'been reverted back to '
                                                   : 'entered ';
    const cancelOrStateChangeStr: string = deliveryUpdateNotificationData.cancelled ? 'has been cancelled '
                                                                                : 'has ' + enterOrRevertStr + 'the <b>' + readableDeliveryState + '</b> state '

    return `
        <p>
            The delivery of the food listing titled <b>` + foodTitle + `</b> ` + cancelOrStateChangeStr + `
            due to the activity of the deliverer named <b>` + delivererName + `</b>.
        </p>
    `;
}


/**
 * Generates the middle contents of the body.
 * @param delivererSessionData The user information pertaining to the deliverer.
 * @param deliveryUpdateNotificationData The update notification data used to generate the message subject.
 * @param appUserType The type of the user that this message is designated for (Receiver or Donor).
 * @return The mid body contents.
 */
function generateHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                             appUserType: AppUserType, estimatedArrivalTime: string): string
{        
    if (deliveryUpdateNotificationData.cancelled) {
        return generateCancelledHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData);
    }

    switch (deliveryUpdateNotificationData.newDeliveryState) {
        case DeliveryState.scheduled:
            return generateScheduledHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData, appUserType, estimatedArrivalTime);

        case DeliveryState.started:
            return generateStartedHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData, appUserType, estimatedArrivalTime);

        case DeliveryState.pickedUp:
            return generatePickedUpHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData, appUserType, estimatedArrivalTime);

        case DeliveryState.droppedOff:
            return generateDroppedOffHTMLBodyMid(delivererSessionData, deliveryUpdateNotificationData, appUserType);

        default:
            throw new Error('Incorrect newDeliveryState provided in deliveryUpdateNotificationData object.');
    }
}


/**
 * Generates the middle contents of the body for an update that is a Delivery cancellation.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotificationData See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateCancelledHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData): string {

    return `
        <p>
            The deliverer gave the following reason for the cancellation:
        </p>

        <blockquote>
            <i><b>` + deliveryUpdateNotificationData.cancelReason + `</b></i>
        </blockquote>
    
        <p>
            We apologize for any inconvenience this has caused you.
        </p>

        <p>
            ` + ( deliveryUpdateNotificationData.foodRejected ? `The food listing has been rejected and removed from the system due to the above cancellation reason`
                                                              : `Please wait patiently for another deliverer to schedule and perform the delivery.` ) + `
        </p>
    `;
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Scheduled.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotificationData See generateHTMLBodyMid.
 * @param appUserType See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateScheduledHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                      appUserType: AppUserType, estimatedArrivalTime: string): string
{        
    // Then, generate the scheduled mid body string.
    const scheduledStartTime: Date = deliveryUpdateNotificationData.scheduledStartTime;
    const scheduledStartDateStr: string = moment(scheduledStartTime).format('MM/DD/YYYY');
    const scheduledStartTimeStr: string = moment(scheduledStartTime).format('h:mm a');
    const dropOffOrPickUp: string = (appUserType === AppUserType.Receiver) ? 'drop off'
                                                                           : 'pick up';

    return `
        <p>
            The deliverer has scheduled the delivery to start on <b>` + scheduledStartDateStr + `</b> at <b>` + scheduledStartTimeStr + `</b>.
            You can expect the deliverer to arrive around <b>` + estimatedArrivalTime + `</b> to ` + dropOffOrPickUp + ` the delivery.
        </p>
    `;
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Started.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotificationData See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateStartedHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                    appUserType: AppUserType, estimatedArrivalTime: string): string
{    
    // Then, generate the started mid body string.
    const dropOffOrPickUp: string = (appUserType === AppUserType.Receiver) ? 'drop off '
                                                                           : 'pick up ';

    return `
        <p>
            The deliverer has started the delivery. You can expect the deliverer to arrive around <b>
            ` + estimatedArrivalTime + `</b> to ` + dropOffOrPickUp + `the delivery.
        </p>
    `;
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Picked Up.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotificationData See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generatePickedUpHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData,
                                     appUserType: AppUserType, estimatedArrivalTime: string): string
{
    let receiverArrivalTimeMsg: string = '';
    
    // Since deliverer has already arrived at Donor, we only want to tell Receiver of estimated arrival time!
    if (appUserType === AppUserType.Receiver) {
        receiverArrivalTimeMsg = 'You can expect the deliverer to arrive around <b>' + estimatedArrivalTime + '</b> to drop off the delivery.';
    }

    return `
        <p>
            The deliverer has picked up the delivery from the donor and is on route to the receiver. ` + receiverArrivalTimeMsg + `
        </p>
    `;
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Dropped Off (Completed).
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotificationData See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateDroppedOffHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData, appUserType: AppUserType): string {
    
    return `
        <p>
            The delivery has been dropped off at the receiver, and it is now complete.
        </p>
    `;
}


/**
 * Gets the estimated arrival time strings (in wall clock time format) for the Donor and Receiver along a delivery path.
 * @param delivererSessionData The session data for the deliverer (contains GPS Coordinate).
 * @param deliveryUpdateNotificationData Contains information to generate the estimated arrival time (Donor & Receiver GPS coordinates).
 * @return A map containing the estimated arrival times for the Donor and Receiver.
 *         NOTE: If the delivery is on or after the picked up state, then since the Donor has already been visited by the deliverer, their arrival time will be null!
 */
async function getEstimatedArrivalTimeStrs(delivererSessionData: SessionData, deliveryUpdateNotificationData: DeliveryUpdateNotificationData): Promise <Map <string, string>> {
    
    // If in dropped off state, then just return right away with empty map for arrival times.
    const wasDroppedOff: boolean = ( deliveryUpdateNotificationData.newDeliveryState === DeliveryState.droppedOff );
    if (wasDroppedOff)  return new Map ();

    const delivererGPSCoordinate: GPSCoordinate = delivererSessionData.appUser.contactInfo.gpsCoordinate;
    const donorGPSCoordinate: GPSCoordinate     = deliveryUpdateNotificationData.donorSessionData.appUser.contactInfo.gpsCoordinate;
    const receiverGPSCoordinate: GPSCoordinate  = deliveryUpdateNotificationData.receiverSessionData.appUser.contactInfo.gpsCoordinate;

    // Generate travel start time based one whether or not in scheduled state.
    const inScheduledState: boolean = ( deliveryUpdateNotificationData.newDeliveryState === DeliveryState.scheduled );
    const travelStartTime: Date = ( inScheduledState ? deliveryUpdateNotificationData.scheduledStartTime
                                                     : new Date() ); // new Date() = now

    // If in picked up state, then we don't want to include route segment from deliverer to donor, since deliverer is at the donor!
    const wasPickedUp: boolean = ( deliveryUpdateNotificationData.newDeliveryState === DeliveryState.pickedUp );
    let routeGPSCoordinates: GPSCoordinate[] = ( wasPickedUp ? [ donorGPSCoordinate, receiverGPSCoordinate ]
                                                             : [ delivererGPSCoordinate, donorGPSCoordinate, receiverGPSCoordinate ] );
    
    const estimatedArrivalTimes: Date[] = await getEstimatedArrivalTimes(routeGPSCoordinates, travelStartTime);
    return new Map ([
        [ 'Donor', ( wasPickedUp ? null : moment(estimatedArrivalTimes[0]).format('h:mm a') ) ],
        [ 'Receiver', moment(estimatedArrivalTimes[estimatedArrivalTimes.length - 1]).format('h:mm a') ]
    ]);
}
