import { SessionData } from "../../common-util/session-data";
import { sendEmail, MailConfig } from "../../common-util/email";

import { AppUserType } from "../../../../shared/app-user/app-user-info";


/**
 * Container for data needed for an unclaim notification whenever a Food Listing is unclaimed (or removed causing an unclaim).
 */
export class UnclaimNotificationData {

    public constructor (
        public foodTitle: string,
        public oldClaimedUnitsCount: number,
        public newClaimedUnitsCount: number,
        public unitsLabel: string,
        public receiverSessionData: SessionData,
        public delivererSessionData: SessionData
    ) {}
}


/**
 * Notifies an affected receivers of the removal/unclaim of Food Listing.
 * @param donorSessionData Data concerning the donor who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyReceiverOfUnclaim(donorSessionData: SessionData, unclaimNotificationData: UnclaimNotificationData): Promise<void> {
    
    const receiverEmail: string = unclaimNotificationData.receiverSessionData.appUserInfo.email;
    const receiverOrganization: string = unclaimNotificationData.receiverSessionData.appUserInfo.organizationName;
    const unitsLabel: string = unclaimNotificationData.unitsLabel ? unclaimNotificationData.unitsLabel
                                                              : 'units';
    const oldUnitsCount: number = unclaimNotificationData.oldClaimedUnitsCount;
    const newUnitsCount: number = unclaimNotificationData.newClaimedUnitsCount;
    const unitsUnclaimedCount: number = ( oldUnitsCount - newUnitsCount );
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const donorOrganization: string = donorSessionData.appUserInfo.organizationName;

    let unitsUnclaimedText: string = '';
    let unitsRemainingText: string = '';
    
    if (newUnitsCount !== 0) {
        unitsUnclaimedText = ( unitsUnclaimedCount + ' ' + unitsLabel + ' of ' );
        unitsRemainingText = ( 'You have <b>' + newUnitsCount + unitsLabel + '</b> remaining ');
    }

    let htmlContents: string = `
        <p>
            Dear ` + receiverOrganization + `,
        </p>

        <p>
            We regret to inform you that ` + unitsUnclaimedText +
            `your claimed food titled <b>` + foodTitle + `</b> has been removed by the donor <b>` + donorOrganization + `</b>.<br>` +
            unitsRemainingText + `
        </p>

        <p>
            We are sorry for any inconvenience that this has caused you. Please browse and claim other available food donations
            at our <a href="` + process.env.HOST_ADDRESS + `/receive">Receive</a> tab.
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
 * Notifies an affected deliverers of the removal/unclaim of Food Listing.
 * @param sourceSessionData Data concerning the receiver or donor who submitted the remove/unclaim operation.
 * @param sourceAppUserType The type of the user (receiver or donor) who submitted the remove/unclaim operation.
 * @param unclaimNotificationData Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyDelivererOfUnclaim(sourceSessionData: SessionData, sourceAppUserType: string, unclaimNotificationData: UnclaimNotificationData): Promise<void> {
    
    const delivererEmail: string = unclaimNotificationData.delivererSessionData.appUserInfo.email;
    const delivererName: string = ( unclaimNotificationData.delivererSessionData.appUserInfo.firstName + ' ' +
                                    unclaimNotificationData.delivererSessionData.appUserInfo.lastName );
    const foodTitle: string = unclaimNotificationData.foodTitle;
    const sourceOrganization: string = sourceSessionData.appUserInfo.organizationName;

    let htmlContents: string = `
        <p>
            Dear ` + delivererName + `,
        </p>

        <p>
            We regret to inform you that your scheduled delivery titled
            <b>` + foodTitle + `</b> has been removed by the ` + sourceAppUserType + `
            <b>` + sourceOrganization + `</b>.
        </p>

        <p>
            We are sorry for any inconvenience that this has caused you. Please browse and schedule other deliveries
            at our <a href="` + process.env.HOST_ADDRESS + `/deliver">Deliver</a> tab.
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
