import { SessionData } from "../../common-util/session-data";

let nodemailer = require("nodemailer-promise");
let sendEmail = nodemailer.config({
    email: process.env.NOREPLY_EMAIL,
    password: process.env.NOREPLY_PASSWORD,
    server: process.env.NOREPLY_SERVER
});
require('dotenv');


export class AffectedUnclaimNotification {

    public constructor (
        public foodTitle: string,
        public unitsCount: number,
        public unitsLabel: string,
        public allUnitsAffected: boolean,
        public receiverSessionData: SessionData,
        public delivererSessionData: SessionData
    ) {}


    public static 
}


/**
 * Notifies an affected receivers of the removal.
 * @param donorSessionData Data concerning the donor who submitted the remove operation.
 * @param affectedUnclaimNotification Data required to notify all affected parties of the remove operation.
 */
export function notifyAffectedReceiver(donorSessionData: SessionData, affectedUnclaimNotification: AffectedUnclaimNotification): Promise<void> {
    
    const affectedEmail: string = affectedUnclaimNotification.receiverSessionData.appUserInfo.email;
    const affectedOrganization: string = affectedUnclaimNotification.receiverSessionData.appUserInfo.organizationName;
    const unitsLabel: string = affectedUnclaimNotification.unitsLabel;
    const unitsCount: number = affectedUnclaimNotification.unitsCount;
    const allUnitsAffected: boolean = affectedUnclaimNotification.allUnitsAffected;
    const foodTitle: string = affectedUnclaimNotification.foodTitle;
    const donorOrganization: string = donorSessionData.appUserInfo.organizationName;

    let mailOptions = {
        subject: 'Claimed Food Removed by Donor',
        senderName: 'Food Web',
        receiver: affectedEmail,
        html: ` <p>
                    Dear ` + affectedOrganization + `,
                </p>

                <p>
                    We regret to inform you that `
                    + (allUnitsAffected && unitsLabel != null) ? (unitsCount + ' ' + unitsLabel + ' of ') : ' ' +
                    `your claimed food titled <b>` + foodTitle + `<b> has been removed by the donor <b>` + donorOrganization + `</b>.
                </p>

                <p>
                    We are sorry for any inconvenience that this has caused you. Please browse and claim other available food donations
                    <a href="` + process.env.HOST_ADDRESS + `/receive">here</a>
                </p>`
    };

    return sendEmail(mailOptions)
        .catch((err: Error) => { console.log(err); });
}


/**
 * Notifies an affected deliverers of the removal/unclaim of Food Listing.
 * @param sourceSessionData Data concerning the receiver or donor who submitted the remove/unclaim operation.
 * @param sourceAppUserType The type of the user (receiver or donor) who submitted the remove/unclaim operation.
 * @param affectedUnclaimNotification Data required to notify all affected parties of the remove/unclaim operation.
 */
export function notifyAffectedDeliverer(sourceSessionData: SessionData, sourceAppUserType: string, affectedUnclaimNotification: AffectedUnclaimNotification): Promise<void> {
    
    const affectedEmail: string = affectedUnclaimNotification.delivererSessionData.appUserInfo.email;
    const affectedName: string = ( affectedUnclaimNotification.delivererSessionData.appUserInfo.firstName + ' ' +
                                   affectedUnclaimNotification.delivererSessionData.appUserInfo.lastName );
    const unitsLabel: string = affectedUnclaimNotification.unitsLabel;
    const unitsCount: number = affectedUnclaimNotification.unitsCount;
    const foodTitle: string = affectedUnclaimNotification.foodTitle;
    const sourceOrganization: string = sourceSessionData.appUserInfo.organizationName;

    let mailOptions = {
        subject: 'Scheduled Delivery Cancelled',            
        senderName: 'Food Web',
        receiver: affectedEmail,
        html: ` <p>
                    Dear ` + affectedName + `,
                </p>

                <p>
                    We regret to inform you that your scheduled delivery titled
                    <b>` + foodTitle + `<b> has been removed by the ` + sourceAppUserType + `
                    <b>` + sourceOrganization + `</b>.
                </p>

                <p>
                    We are sorry for any inconvenience that this has caused you. Please browse and schedule other deliveries
                    <a href="` + process.env.HOST_ADDRESS + `/deliver">here</a>
                </p>`
    };

    return sendEmail(mailOptions)
        .catch((err: Error) => { console.log(err); });
}
