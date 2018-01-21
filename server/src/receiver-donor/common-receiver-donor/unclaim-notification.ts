import { SessionData } from "../../common-util/session-data";
import { sendEmail, MailConfig } from "../../common-util/email";

import { AppUserType, AppUserInfo } from "../../../../shared/app-user/app-user-info";


/**
 * Container for data needed for an unclaim notification whenever a Food Listing is unclaimed (or removed causing an unclaim).
 */
export class UnclaimNotificationData {

    public constructor (
        public foodTitle: string,
        public unclaimReason: string,
        public donorSessionData: SessionData,
        public receiverSessionData: SessionData,
        public delivererSessionData: SessionData
    ) {}
}


/**
 * Notifies an affected receivers of the removal/unclaim of Food Listing.
 * @param donorSessionData Data concerning the donor who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyReceiverOfUnclaim(unclaimNotificationData: UnclaimNotificationData): Promise<void> {
    
    const receiverEmail: string = unclaimNotificationData.receiverSessionData.appUserInfo.email;
    const receiverOrganization: string = unclaimNotificationData.receiverSessionData.appUserInfo.organizationName;
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const donorOrganization: string = unclaimNotificationData.donorSessionData.appUserInfo.organizationName;

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

    let mailConfig: MailConfig = new MailConfig (
        ( 'Update of Claimed Food Titled: ' + foodTitle ),
        receiverOrganization,
        receiverEmail,
        AppUserType.Receiver,
        htmlContents
    )

    return sendEmail(mailConfig)
        .catch((err: Error) => { console.log(err); });
}


/**
 * Notifies an affected donor of a lost delivery due to the unclaiming of the related Food Listing.
 * @param unclaimNotificationData Data required to notify all affected parties of the lost delivery as a result of an unclaim operation.
 */
export function notifyDonorOfLostDelivery(unclaimNotificationData: UnclaimNotificationData): Promise<void> {

    const donorEmail: string = unclaimNotificationData.donorSessionData.appUserInfo.email;
    const donorOrganization: string = unclaimNotificationData.donorSessionData.appUserInfo.organizationName;
    const receiverOrganization: string = unclaimNotificationData.receiverSessionData.appUserInfo.organizationName;
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const delivererAppUserInfo: AppUserInfo = unclaimNotificationData.delivererSessionData.appUserInfo;
    const delivererName: string = ( delivererAppUserInfo.firstName + ' ' + delivererAppUserInfo.lastName );

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

    let mailConfig: MailConfig = new MailConfig (
        ( 'Update of Claimed Food Titled: ' + foodTitle ),
        donorOrganization,
        donorEmail,
        AppUserType.Donor,
        htmlContents
    )

    return sendEmail(mailConfig)
        .catch((err: Error) => { console.log(err); });
}


/**
 * Notifies an affected deliverers of the lost delivery as a result of a removal/unclaim of Food Listing.
 * @param sourceSessionData Data concerning the receiver or donor who submitted the remove/unclaim operation.
 * @param sourceAppUserType The type of the user (receiver or donor) who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyDelivererOfLostDelivery(sourceSessionData: SessionData, sourceAppUserType: string, unclaimNotificationData: UnclaimNotificationData): Promise<void> {
    
    const delivererEmail: string = unclaimNotificationData.delivererSessionData.appUserInfo.email;
    const delivererName: string = ( unclaimNotificationData.delivererSessionData.appUserInfo.firstName + ' ' +
                                    unclaimNotificationData.delivererSessionData.appUserInfo.lastName );
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const sourceOrganization: string = sourceSessionData.appUserInfo.organizationName;

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

    let mailConfig: MailConfig = new MailConfig (
        ( 'Delivery Cancelled for Food Titled: ' + foodTitle ),
        delivererName,
        delivererEmail,
        AppUserType.Deliverer,
        htmlContents
    )

    return sendEmail(mailConfig)
        .catch((err: Error) => { console.log(err); });
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
