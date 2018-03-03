import * as striptags from "striptags";
import { prettyjsonRender } from "./../logging/logger";
import { logger } from '../logging/logger';
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
require('dotenv');


const phoneUtil: PhoneNumberUtil = PhoneNumberUtil.getInstance();
const twilio = require('twilio');
const twilioClient = new twilio(process.env.FOOD_WEB_TWILIO_SID, process.env.FOOD_WEB_TWILIO_AUTH_TOKEN);


/**
 * Sends an SMS (text) message.
 * @param body The body/content of the message.
 * @param to The phone number of the recipient.
 * @param from The phone number that we will use to send (should be valid Twilio number).
 * @return A promise that resolves to nothing upon success.
 */
export async function sendSMS(body: string, to: string, bodyHtmlToPlainTxt: boolean = false, from: string = process.env.FOOD_WEB_TWILIO_PHONE_NUMBER): Promise <void> {

    try {
        // Ensure that the number we are sending to is in the correct format.
        to = phoneUtil.format(phoneUtil.parse(to, 'US'), PhoneNumberFormat.INTERNATIONAL);

        body = bodyHtmlToPlainTxt ? htmlToPlainTxt(body)
                                  : body;

        const responseMessage: any = await twilioClient.messages.create({
            body: body,
            to: to,
            from: from
        });
    
        logger.debug(responseMessage);
    }
    catch (err) {
        logger.error(err);
    }
}


/**
 * Converts HTML string to plain text string (removes all tags and optionally indentations).
 * @param htmlStr The HTML string to convert to plain text.
 * @param removeIndentation Default is true. When set true, indentation (whitespace at beginning of new line) is removed.
 * @return The plain text conversion result.
 */
export function htmlToPlainTxt(htmlStr: string, removeIndentation: boolean = true): string {
    return removeIndentation ? striptags(htmlStr).replace(/\n[ \t]+/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
                             : striptags(htmlStr);
}
