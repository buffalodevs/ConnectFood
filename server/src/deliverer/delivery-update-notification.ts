import * as moment from 'moment';

import { SessionData, AppUserInfo } from "../common-util/session-data";
import { DriveDistTime, GPSCoordinate, getRouteSegmentDrivingDistTimes, getEstimatedArrivalTimes } from "../common-util/geocode";
import { MailConfig, sendEmail } from "../common-util/email";

import { DeliveryUtil, DeliveryState } from "../../../shared/deliverer/delivery-util";
import { AppUserType } from '../../../shared/app-user/app-user-info';
import { DateFormatter } from "../../../shared/common-util/date-formatter";


/**
 * A container for data required to notify users whenever a Delivery is updated.
 */
export class DeliveryUpdateNotification {

    public constructor (
        public foodTitle: string,
        public oldDeliveryState: DeliveryState,
        public newDeliveryState: DeliveryState,
        public scheduledStartTime: Date,
        public cancelled: boolean,
        public cancelReason: string,
        public foodRejected: boolean,
        public receiverSessionData: SessionData,
        public donorSessionData: SessionData,
        public delivererSessionData: SessionData
    ) {}
}


/**
 * Notifies both the affected receiver and donor of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotification Data required to notify all affected parties of the delivery state change operation.
 * @return A promise that resolves to nothing on success.
 */
export function notifyReceiverAndDonorOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification): Promise<void> {
    return notifyDonorOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotification)
        .then(() => {
            return notifyReceiverOfDeliveryUpdate(delivererSessionData, deliveryUpdateNotification);
        });
}


/**
 * Notifies an affected receiver of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotification Data required to notify all affected parties of the delivery state change operation.
 * @return A promise that resolves to nothing on success.
 */
function notifyReceiverOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification): Promise<void> {
    return generateAndSendEmail(delivererSessionData, deliveryUpdateNotification, AppUserType.Receiver);
    // TODO: Chain to promise and send text message.
}


/**
 * Notifies an affected donor of the state change of a Delivery.
 * @param delivererSessionData Data concerning the deliverer who submitted the delivery state change operation.
 * @param deliveryUpdateNotification Data required to notify all affected parties of the delivery state change operation.
 * @return A promise that resolves to nothing on success.
 */
function notifyDonorOfDeliveryUpdate(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification): Promise<void> {
    return generateAndSendEmail(delivererSessionData, deliveryUpdateNotification, AppUserType.Donor);
    // TODO: Chain to promise and send text message.
}


/**
 * Generates and sends an email message notifying a given user that a Delivery has changed state or was cancelled.
 * @param delivererSessionData The session data pertaining to the deliverer.
 * @param deliveryUpdateNotification The update notification data used to generate the message.
 * @param appUserType The type of the user (Receiver or Donor) that the message is being sent to.
 */
function generateAndSendEmail(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<void> {

    return generateHTMLBodyMid(delivererSessionData, deliveryUpdateNotification, appUserType)
        .then((htmlBodyMid: string) => {

            // Are we targeting the Donor or Receiver?
            const targetUser: AppUserInfo = (appUserType === AppUserType.Receiver) ? deliveryUpdateNotification.receiverSessionData.appUserInfo
                                                                                   : deliveryUpdateNotification.donorSessionData.appUserInfo;

            // Generate our mail configuration for sending the update notification email (includes options and payload data).
            const mailConfig: MailConfig = new MailConfig (
                deliveryUpdateNotification.foodTitle + ' Update Notification',
                targetUser.organizationName,
                targetUser.email,
                appUserType,
                ( generateHTMLBodyStart(delivererSessionData, deliveryUpdateNotification) + htmlBodyMid )
            );
        
            // Send the email with our generated mail configuration.
            return sendEmail(mailConfig)
                .catch((err: Error) => {
                    console.log(err);
                    throw new Error('Failed to email notification of delivery update to concerned donor and receiver');
                });
        });
} 


/**
 * Generates the starting contents of the email message body.
 * @param delivererSessionData The user information pertaining to the deliverer.
 * @param deliveryUpdateNotification The update notification data used to generate the message subject.
 * @return The starting body contents.
 */
function generateHTMLBodyStart(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification): string {

    const foodTitle: string = deliveryUpdateNotification.foodTitle;
    const delivererName: string = ( delivererSessionData.appUserInfo.firstName + ' ' + delivererSessionData.appUserInfo.lastName );
    const readableDeliveryState: string = DeliveryUtil.getReadableDeliveryState(deliveryUpdateNotification.newDeliveryState);

    const stateReverted: boolean = ( DeliveryUtil.compareDeliveryStates(deliveryUpdateNotification.newDeliveryState, deliveryUpdateNotification.oldDeliveryState) < 0 );
    const enterOrRevertStr: string = stateReverted ? 'been reverted back to '
                                                   : 'entered ';
    const cancelOrStateChangeStr: string = deliveryUpdateNotification.cancelled ? 'has been cancelled '
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
 * @param deliveryUpdateNotification The update notification data used to generate the message subject.
 * @param appUserType The type of the user that this message is designated for (Receiver or Donor).
 * @return The mid body contents.
 */
function generateHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<string> {

    return Promise.resolve().then(() => {

        let htmlBody: string | Promise<string>;
        
        if (deliveryUpdateNotification.cancelled) {
            htmlBody = generateCancelledHTMLBodyMid(delivererSessionData, deliveryUpdateNotification);
        }
        else {
    
            switch (deliveryUpdateNotification.newDeliveryState) {
                case DeliveryState.scheduled:   htmlBody = generateScheduledHTMLBodyMid(delivererSessionData, deliveryUpdateNotification, appUserType);   break;
                case DeliveryState.started:     htmlBody = generateStartedHTMLBodyMid(delivererSessionData, deliveryUpdateNotification, appUserType);     break;
                case DeliveryState.pickedUp:    htmlBody = generatePickedUpHTMLBodyMid(delivererSessionData, deliveryUpdateNotification, appUserType);    break;
                case DeliveryState.droppedOff:  htmlBody = generateDroppedOffHTMLBodyMid(delivererSessionData, deliveryUpdateNotification, appUserType);  break;
                default:                        throw new Error('Incorrect newDeliveryState provided in deliveryUpdateNotification object.');
            }
        }
    
        return htmlBody;
    });
}


/**
 * Generates the middle contents of the body for an update that is a Delivery cancellation.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotification See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateCancelledHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification): string {

    return `
        <p>
            The deliverer gave the following reason for the cancellation:
        </p>

        <blockquote>
            <i><b>` + deliveryUpdateNotification.cancelReason + `</b></i>
        </blockquote>
    
        <p>
            We apologize for any inconvenience this has caused you.<br>
            ` + ( deliveryUpdateNotification.foodRejected ? `The food listing has been rejected and removed from the system due to the above cancellation reason`
                                                          : `Please wait patiently for another deliverer to schedule and perform the delivery.` ) + `
        </p>
    `;
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Scheduled.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotification See generateHTMLBodyMid.
 * @param appUserType See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateScheduledHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<string> {

    // First, get estimated arrival times at user specified by appUserType.
    return getEstimatedArrivalTimeStr(delivererSessionData, deliveryUpdateNotification, appUserType)
        // Then, generate the scheduled mid body string.
        .then((estimatedArrivalTimeStr: string) => {

            const scheduledStartTime: Date = deliveryUpdateNotification.scheduledStartTime;
            const scheduledStartDateStr: string = moment(scheduledStartTime).format('MM/DD/YYYY');
            const scheduledStartTimeStr: string = moment(scheduledStartTime).format('h:mm a');
            const dropOffOrPickUp: string = (appUserType === AppUserType.Receiver) ? 'drop off'
                                                                                   : 'pick up';

            return `
                <p>
                    The deliverer has scheduled the delivery to start on <b>` + scheduledStartDateStr + `</b> at <b>` + scheduledStartTimeStr + `</b>.
                    You can expect the deliverer to arrive around <b>` + estimatedArrivalTimeStr + `</b> to ` + dropOffOrPickUp + ` the delivery.
                </p>
            `;
        });
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Started.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotification See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateStartedHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<string> {
    
    // First, get estimated arrival times at user specified by appUserType.
    return getEstimatedArrivalTimeStr(delivererSessionData, deliveryUpdateNotification, appUserType)
        // Then, generate the started mid body string.
        .then((estimatedArrivalTimeStr: string) => {

            const dropOffOrPickUp: string = (appUserType === AppUserType.Receiver) ? 'drop off '
                                                                                   : 'pick up ';

            return `
                <p>
                    The deliverer has started the delivery. You can expect the deliverer to arrive around <b>
                    ` + estimatedArrivalTimeStr + `</b> to ` + dropOffOrPickUp + `the delivery.
                </p>
            `;
        });
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Picked Up.
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotification See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generatePickedUpHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<string> {
    
    let estimatedArrivalTimePromise: Promise<string> = Promise.resolve(null);

    // Only get estimated arrival time for the receiver since the deliverer has already been to the donor!
    if (appUserType === AppUserType.Receiver) {
        estimatedArrivalTimePromise = getEstimatedArrivalTimeStr(delivererSessionData, deliveryUpdateNotification, appUserType);
    }

    // First, get estimated arrival times at user specified by appUserType.
    return estimatedArrivalTimePromise
        // Then, generate the picked up mid body string.
        .then((estimatedArrivalTimeStr: string) => {

            let receiverArrivalTimeStr: string = '';

            // Since deliverer has already arrived at Donor, we only want to tell Receiver of estimated arrival time!
            if (appUserType === AppUserType.Receiver) {
                receiverArrivalTimeStr = 'You can expect the deliverer to arrive around <b>' + estimatedArrivalTimeStr + '</b> to drop off the delivery.';
            }

            return `
                <p>
                    The deliverer has picked up the delivery from the donor and is on route to the receiver. ` + receiverArrivalTimeStr + `
                </p>
            `;
        });
}


/**
 * Generates the middle contents of the body for an update that is a Delivery state change to Dropped Off (Completed).
 * @param delivererSessionData See generateHTMLBodyMid.
 * @param deliveryUpdateNotification See generateHTMLBodyMid.
 * @return The mid body contents.
 */
function generateDroppedOffHTMLBodyMid(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): string {
    
    return `
        <p>
            The delivery has been dropped off at the receiver, and it is now complete.
        </p>
    `;
}


/**
 * Gets the estimated arrival time string in wall clock time format for a given user type.
 * @param delivererSessionData The session data for the deliverer (contains GPS Coordinate).
 * @param deliveryUpdateNotification Contains information to generate the estimated arrival time with.
 * @param appUserType The type of the user to get the estimated arrival time string for.
 * @return The estimated arrival wall clock time string.
 */
function getEstimatedArrivalTimeStr(delivererSessionData: SessionData, deliveryUpdateNotification: DeliveryUpdateNotification, appUserType: AppUserType): Promise<string> {
    
    const delivererGPSCoordinate: GPSCoordinate = delivererSessionData.appUserInfo.gpsCoordinate;
    const donorGPSCoordinate: GPSCoordinate = deliveryUpdateNotification.donorSessionData.appUserInfo.gpsCoordinate;
    const receiverGPSCoordinate: GPSCoordinate = deliveryUpdateNotification.receiverSessionData.appUserInfo.gpsCoordinate;

    // Generate travel start time based one whether or not in scheduled state.
    const travelStartTime: Date = (deliveryUpdateNotification.newDeliveryState === DeliveryState.scheduled) ? deliveryUpdateNotification.scheduledStartTime
                                                                                                            : new Date(); // Now

    let routeGPSCoordinates: GPSCoordinate[] = [ donorGPSCoordinate ];
    // If in picked up state, then we don't want to include route segment from deliverer to donor, since deliverer is at the donor!
    if (deliveryUpdateNotification.newDeliveryState !== DeliveryState.pickedUp) routeGPSCoordinates.unshift(delivererGPSCoordinate);
    // If we are only concerned about ETA for the donor, then we don't need to include the receiver in route coordinates!
    if (appUserType === AppUserType.Receiver)                                   routeGPSCoordinates.push(receiverGPSCoordinate);

    return getEstimatedArrivalTimes(routeGPSCoordinates, travelStartTime)
        .then((estimatedArrivalTimes: Date[]) => {

            const estimatedArrivalTime: Date = estimatedArrivalTimes[estimatedArrivalTimes.length - 1];
            return moment(estimatedArrivalTime).format('h:mm a');
        })
}
