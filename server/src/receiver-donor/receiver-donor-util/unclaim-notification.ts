import { SessionData } from "../../common-util/session-data";
import { UnclaimNotificationData } from './unclaim-notification-data';
import { sendEmail, EmailConfig } from "../../email/email";
import { logger, prettyjsonRender } from '../../logging/logger';

import { AppUserType, AppUser } from "../../../../shared/src/app-user/app-user";

export { UnclaimNotificationData };


/**
 * Notifies an affected receivers of the removal/unclaim of Food Listing.
 * @param donorSessionData Data concerning the donor who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyReceiverOfUnclaim(unclaimNotificationData: UnclaimNotificationData): Promise <void> {
    
    const receiverEmail: string = unclaimNotificationData.receiverSessionData.appUser.email;
    const receiverOrganization: string = unclaimNotificationData.receiverSessionData.appUser.organization.name;
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const donorOrganization: string = unclaimNotificationData.donorSessionData.appUser.organization.name;

    let htmlContents: string = `
        <p>
            We regret to inform you that your claimed food titled <b>` + foodTitle + `</b> has been removed by the donor <b>` + donorOrganization + `</b>.<br>
        </p>

        <p>
            ` + donorOrganization + ` gave the following reason for the removal of their donation:<br>
        </p>

        ` + genUnclaimReasonHTML(unclaimNotificationData.unclaimReason) + `

        <p>
            We are sorry for any inconvenience that this has caused you. Please browse and claim other available food donations
            on our website at our <a href="` + process.env.HOST_ADDRESS + `/receive">Receive</a> tab.
        </p>
    `

    let emailConfig: EmailConfig = new EmailConfig (
        ( 'Update of Claimed Food Titled: ' + foodTitle ),
        receiverOrganization,
        receiverEmail,
        AppUserType.Receiver,
        htmlContents
    )

    return sendEmail(emailConfig)
        .catch((err: Error) => { logger.error(prettyjsonRender(err)); });
}


/**
 * Notifies an affected donor of a lost delivery due to the unclaiming of the related Food Listing.
 * @param unclaimNotificationData Data required to notify all affected parties of the lost delivery as a result of an unclaim operation.
 */
export function notifyDonorOfLostDelivery(unclaimNotificationData: UnclaimNotificationData): Promise <void> {

    const donorEmail: string = unclaimNotificationData.donorSessionData.appUser.email;
    const donorOrganization: string = unclaimNotificationData.donorSessionData.appUser.organization.name;
    const receiverOrganization: string = unclaimNotificationData.receiverSessionData.appUser.organization.name;
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const delivererAppUser: AppUser = unclaimNotificationData.delivererSessionData.appUser;
    const delivererName: string = ( delivererAppUser.firstName + ' ' + delivererAppUser.lastName );

    let htmlContents: string = `
        <p>
            We regret to inform you that the receiver <b>` + receiverOrganization + `</b>
            has unclaimed your donated food titled <b>` + foodTitle + `</b>.
        </p>

        <p>
            ` + receiverOrganization + ` gave the following reason for the removal of their claim:<br>
        </p>

        ` + genUnclaimReasonHTML(unclaimNotificationData.unclaimReason) + `

        <p>
            Therefore, the corresponding delivery has been cancelled. The deliverer
            named <b>` + delivererName + `</b> has also been notified about the cancellation.
        </p>

        <p>
            We are sorry for any inconvenience that this has caused you.<br>
            Please wait patiently for another receiver to claim your donation.
        </p>
    `

    let emailConfig: EmailConfig = new EmailConfig (
        ( 'Update of Claimed Food Titled: ' + foodTitle ),
        donorOrganization,
        donorEmail,
        AppUserType.Donor,
        htmlContents
    )

    return sendEmail(emailConfig)
        .catch((err: Error) => { logger.error(prettyjsonRender(err)); });
}


/**
 * Notifies an affected deliverers of the lost delivery as a result of a removal/unclaim of Food Listing.
 * @param sourceSessionData Data concerning the receiver or donor who submitted the remove/unclaim operation.
 * @param sourceAppUserType The type of the user (receiver or donor) who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyDelivererOfLostDelivery(sourceSessionData: SessionData, sourceAppUserType: string, unclaimNotificationData: UnclaimNotificationData): Promise <void> {
    
    const delivererEmail: string = unclaimNotificationData.delivererSessionData.appUser.email;
    const delivererName: string = ( unclaimNotificationData.delivererSessionData.appUser.firstName + ' ' +
                                    unclaimNotificationData.delivererSessionData.appUser.lastName );
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const sourceOrganization: string = sourceSessionData.appUser.organization.name;

    let htmlContents: string = `
        <p>
            We regret to inform you that your scheduled delivery titled
            <b>` + foodTitle + `</b> has been removed by the ` + sourceAppUserType + `
            <b>` + sourceOrganization + `</b>.
        </p>

        <p>
            ` + sourceOrganization + ` gave the following reason for the removal of the delivery:<br>
        </p>

        ` + genUnclaimReasonHTML(unclaimNotificationData.unclaimReason) + `

        <p>
            We are sorry for any inconvenience that this has caused you. Please browse and schedule other deliveries
            on our website at our <a href="` + process.env.HOST_ADDRESS + `/deliver">Deliver</a> tab.
        </p>
    `;

    let emailConfig: EmailConfig = new EmailConfig (
        ( 'Delivery Cancelled for Food Titled: ' + foodTitle ),
        delivererName,
        delivererEmail,
        AppUserType.Deliverer,
        htmlContents
    )

    return sendEmail(emailConfig)
        .catch((err: Error) => { logger.error(prettyjsonRender(err)); });
}


/**
 * Generates blockquote HTML for the unclaim reason.
 * @param unclaimReason The unclaim reason.
 * @return The HTML string.
 */
function genUnclaimReasonHTML(unclaimReason: string): string {

    return `
        <blockquote>
            <i><b>` + unclaimReason + `</b></i>
        </blockquote>
    `;
}
