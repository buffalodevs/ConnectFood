import * as _ from "lodash";

import { EmailConfig } from "./email-config";
import { AppUserType } from "../../../shared/src/app-user/app-user";
import { logger, prettyjsonRender } from "../logging/logger";

export { EmailConfig };

let nodemailer = require("nodemailer-promise");
let fs = require('fs');
let juice = require('juice');
let _sendEmail = nodemailer.config({
    email: process.env.FOOD_WEB_NOREPLY_EMAIL,
    password: process.env.FOOD_WEB_NOREPLY_PASSWORD,
    server: process.env.FOOD_WEB_NOREPLY_SERVER
});
require('dotenv');


const EMAIL_CONTAINER_HTML_PATH: string = 'email-container.html';
const INJECT_VARIABLE_OPEN_BRACE: string = _.escapeRegExp('{{');
const INJECT_VARIABLE_CLOSE_BRACE: string = _.escapeRegExp('}}');


/**
 * Sends an email based off of a given mail configuration.
 * @param emailConfig The email configuration.
 * @return A promise that resolves to nothing on success.
 */
export async function sendEmail(emailConfig: EmailConfig): Promise <void> {

    try {

        // First, get the string form of the HTML template (with inlined CSS) that will serve as the content of the email.
        const emailHTMLStr: string = await genEmailHTMLStr(emailConfig);

        // Finally, send the email with the content set as the pre-processed HTML string.
        _sendEmail({
            subject: emailConfig.subject,
            senderName: 'Food Web',
            receiver: emailConfig.receiverEmail,
            html: emailHTMLStr
        })
    }
    catch (err) {
        logger.error(prettyjsonRender(err));
        throw err;
    }
}


/**
 * Generates an email HTML string based off of the given mail configurations.
 * @param emailConfig The mail configuration that determines how to generate the email HTML string.
 * @return A promise that on success resolves to the email HTML string (pre-processed to include container HTML and inlined CSS).
 */
function genEmailHTMLStr(emailConfig: EmailConfig): Promise<string> {

    // If we are given the relative path (from client email directory) of an HTML file,
    // then use this to generate HTML, otherwise use given HTML string.
    return (emailConfig.contentHTMLPath) ? genEmailHTMLStrFromHTMLFile(emailConfig)
                                         : genEmailHTMLStrFromHTMLStr(emailConfig);
}


/**
 * Generates the email HTML string from an HTML file whose path is part of the given mail configuration.
 * @param emailConfig The email configuration which contains the path of the HTML file.
 * @return See genEmailHTMLStr for details.
 */
function genEmailHTMLStrFromHTMLFile(emailConfig: EmailConfig): Promise <string> {

    return new Promise((resolve: (string: Promise<string> | string) => void, reject: (err: Error) => void) => {

        fs.readFile(global['clientEmailDir'] + emailConfig.contentHTMLPath, 'utf8', (err: Error, contentHTMLStr: string) => {
    
            if (err != null) {
                logger.error(prettyjsonRender(err));
                return reject(new Error('Could not open and read HTML file contents: ' + emailConfig.contentHTMLPath));
            }
    
            // First, set the contentHTMLStr value of the email configuration so we can work directly on the stirng read form the file.
            emailConfig.contentHTMLStr = contentHTMLStr;

            // Next, perform all necessary injections and css inlines directly on the contents HTML string.
            resolve(genEmailHTMLStrFromHTMLStr(emailConfig));
        });
    });
}


/**
 * Generates the email HTML string from an unprocessed HTML string that is part of the given mail configuration.
 * @param emailConfig The email configuration which contains the unprocessed HTML string.
 * @return See genEmailHTMLStr for details.
 */
function genEmailHTMLStrFromHTMLStr(emailConfig: EmailConfig): Promise<string> {

    return new Promise((resolve: (string: Promise<string> | string) => void, reject: (err: Error) => void) => {
        
        fs.readFile(global['clientEmailDir'] + EMAIL_CONTAINER_HTML_PATH, 'utf8', (err: Error, containerHTMLStr: string) => {
    
            if (err != null) {
                logger.error(prettyjsonRender(err));
                return reject(new Error('Could not open and read ' + EMAIL_CONTAINER_HTML_PATH + ' file contents'));
            }

            // First, inject the email HTML contents given in mailConfig into the container HTML string.
            const emailContainerInjections: Map<string, any> = new Map<string, any>([
                [ 'headerLinks', generateHeaderLinks(emailConfig) ],
                [ 'receiverName', emailConfig.receiverName ],
                [ 'bodyContents', emailConfig.contentHTMLStr ],
                [ 'process.env.FOOD_WEB_SERVER_HOST_ADDRESS', process.env.FOOD_WEB_SERVER_HOST_ADDRESS ],
                [ 'process.env.FOOD_WEB_SERVER_HOST_ADDRESS_READABLE', process.env.FOOD_WEB_SERVER_HOST_ADDRESS_READABLE ]
            ]);
            let containerAndContentsHTMLStr: string = injectVariables(containerHTMLStr, emailContainerInjections);

            // Next, inject any mail configuration provided variables into the resulting containerSAndContentsHTMLStr.
            containerAndContentsHTMLStr = injectVariables(containerAndContentsHTMLStr, emailConfig.injectionVariables);
    
            // Finally, have juice inline all HTML provided in link and style tags.
            resolve(juice(containerAndContentsHTMLStr));
        });
    });
}


/**
 * Generates header links to various tabs of the website based off of a given app user type flag inside a given mail configuration.
 * @param emailConfig The mail configuration.
 * @return The generated header links for the given user type.
 */
function generateHeaderLinks(emailConfig: EmailConfig): string {
    
    let headerLinks: string = '';

    // For deliverer.
    if (emailConfig.receiverAppUserType === AppUserType.Deliverer) {

        headerLinks += `
            <a href="` + process.env.FOOD_WEB_SERVER_HOST_ADDRESS + `/deliver">Delivery</a> |
            <a href="` + process.env.FOOD_WEB_SERVER_HOST_ADDRESS + `/deliveryCart">Delivery Cart</a> |
        `;
    }
    // For donor and receiver.
    else if (emailConfig.receiverAppUserType != null) {

        // For donor.
        if (emailConfig.receiverAppUserType === AppUserType.Donor) {
            headerLinks += `
                <a href="` + process.env.FOOD_WEB_SERVER_HOST_ADDRESS + `/donate">Donate</a> |
            `;
        }
        // For receiver.
        else {
            headerLinks += `
                <a href="` + process.env.FOOD_WEB_SERVER_HOST_ADDRESS + `/receive">Receive</a> |
            `;
        }

        headerLinks += `
            <a href="` + process.env.FOOD_WEB_SERVER_HOST_ADDRESS + `/foodListingCart">Food Cart</a> |
        `;
    }

    return headerLinks;
}


/**
 * Injects given variables into a given HTML string.
 * @param injectIntoHTMLStr The HTML string that the variable values will be injected into.
 * @param injectionVariables The variables that shall be injected.
 * @return injectedIntoHTMLStr with all given variable values injected into it.
 */
function injectVariables(injectIntoHTMLStr: string, injectionVariables: Map<string, any>): string {

    const variableNamesArr: string[] = Array.from(injectionVariables.keys());

    for(let variableName of variableNamesArr) {

        const escapedVariableName = _.escapeRegExp(variableName);
        const replaceRegex: RegExp = new RegExp(INJECT_VARIABLE_OPEN_BRACE + '\\s?' + escapedVariableName + '\\s?' + INJECT_VARIABLE_CLOSE_BRACE, 'g');
        
        injectIntoHTMLStr = injectIntoHTMLStr.replace(replaceRegex, injectionVariables.get(variableName).toString());
    }

    return injectIntoHTMLStr;
}
