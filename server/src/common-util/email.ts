import * as _ from "lodash";
import { AppUserType } from "../../../shared/app-user/app-user-info";

let nodemailer = require("nodemailer-promise");
let fs = require('fs');
let juice = require('juice');
let _sendEmail = nodemailer.config({
    email: process.env.NOREPLY_EMAIL,
    password: process.env.NOREPLY_PASSWORD,
    server: process.env.NOREPLY_SERVER
});
require('dotenv');


const EMAIL_CONTAINER_HTML_PATH: string = 'email-container.html';
const INJECT_VARIABLE_OPEN_BRACE: string = _.escapeRegExp('{{');
const INJECT_VARIABLE_CLOSE_BRACE: string = _.escapeRegExp('}}');


/**
 * Configuration object for sending an email.
 */
export class MailConfig {

    public constructor (
        /**
         * The subject of the email.
         */
        public subject?: string,
        /**
         * The receiving entity's name.
         * NOTE: Will be displayed in the 'Dear' heading of the email!
         */
        public receiverName?: string,
        /**
         * The receiving entity's email address.
         */
        public receiverEmail?: string,
        /**
         * The user type of the email's receiver.
         * NOTE: Will be used to determine which header links to include.
         */
        public receiverAppUserType?: AppUserType,
        /**
         * A string containing the HTML contents for the email.
         * NOTE: The contents will be automatically injected into the email container HTML file contents!
         * NOTE: This is ignored if contentHTMLPath is non-null!
         */
        public contentHTMLStr?: string,
        /**
         * A string containing the path to the HTML contents file for the email.
         * NOTE: The contents will be automatically injected into the email container HTML file contents!
         * NOTE: The path is relative to the client email directory!
         * NOTE: contentHTMLStr is ignored if this is non-null!
         */
        public contentHTMLPath?: string,
        /**
         * Mappings of variable name value pairs.
         * NOTE: These variable values will be injected into the HTML document where ever they appear in between two nestings of curly braces (e.g.: {{ variableName }})!
         * NOTE: Do NOT surround variable names in curly braces, because this is implicitly taken care of!
         */
        public injectionVariables: Map<string, any> = new Map<string, any>()
    ) {}
}


/**
 * Sends an email based off of a given mail configuration.
 * @param mailConfig The mail configuration for the email.
 * @return A promise that resolves to nothing on success.
 */
export function sendEmail(mailConfig: MailConfig): Promise<void> {

    // First, get the string form of the HTML template (with inlined CSS) that will serve as the content of the email.
    return genEmailHTMLStr(mailConfig)
        .then((emailHTMLStr: string) => {

            // Finally, send the email with the content set as the pre-processed HTML string.
            return _sendEmail({
                subject: mailConfig.subject,
                senderName: 'Food Web',
                receiver: mailConfig.receiverEmail,
                html: emailHTMLStr
            })
            .catch((err: Error) => { console.log(err); });
        });
}


/**
 * Generates an email HTML string based off of the given mail configurations.
 * @param mailConfig The mail configuration that determines how to generate the email HTML string.
 * @return A promise that on success resolves to the email HTML string (pre-processed to include container HTML and inlined CSS).
 */
function genEmailHTMLStr(mailConfig: MailConfig): Promise<string> {

    // If we are given the relative path (from client email directory) of an HTML file,
    // then use this to generate HTML, otherwise use given HTML string.
    return (mailConfig.contentHTMLPath) ? genEmailHTMLStrFromHTMLFile(mailConfig)
                                        : genEmailHTMLStrFromHTMLStr(mailConfig);
}


/**
 * Generates the email HTML string from an HTML file whose path is part of the given mail configuration.
 * @param mailConfig The email configuration which contains the path of the HTML file.
 * @return See genEmailHTMLStr for details.
 */
function genEmailHTMLStrFromHTMLFile(mailConfig: MailConfig): Promise<string> {

    return new Promise((resolve: (string: Promise<string> | string) => void, reject: (err: Error) => void) => {

        fs.readFile(global['clientEmailDir'] + mailConfig.contentHTMLPath, 'utf8', (err: Error, contentHTMLStr: string) => {
    
            if (err != null) {
                console.log(err);
                return reject(new Error('Could not open and read HTML file contents: ' + mailConfig.contentHTMLPath));
            }
    
            // First, set the contentHTMLStr value of the email configuration so we can work directly on the stirng read form the file.
            mailConfig.contentHTMLStr = contentHTMLStr;

            // Next, perform all necessary injections and css inlines directly on the contents HTML string.
            resolve(genEmailHTMLStrFromHTMLStr(mailConfig));
        });
    });
}


/**
 * Generates the email HTML string from an unprocessed HTML string that is part of the given mail configuration.
 * @param mailConfig The email configuration which contains the unprocessed HTML string.
 * @return See genEmailHTMLStr for details.
 */
function genEmailHTMLStrFromHTMLStr(mailConfig: MailConfig): Promise<string> {

    return new Promise((resolve: (string: Promise<string> | string) => void, reject: (err: Error) => void) => {
        
        fs.readFile(global['clientEmailDir'] + EMAIL_CONTAINER_HTML_PATH, 'utf8', (err: Error, containerHTMLStr: string) => {
    
            if (err != null) {
                console.log(err);
                return reject(new Error('Could not open and read ' + EMAIL_CONTAINER_HTML_PATH + ' file contents'));
            }

            // First, inject the email HTML contents given in mailConfig into the container HTML string.
            const emailContainerInjections: Map<string, any> = new Map<string, any>([
                [ 'headerLinks', generateHeaderLinks(mailConfig) ],
                [ 'receiverName', mailConfig.receiverName ],
                [ 'bodyContents', mailConfig.contentHTMLStr ],
                [ 'process.env.HOST_ADDRESS', process.env.HOST_ADDRESS ],
                [ 'process.env.HOST_ADDRESS_READABLE', process.env.HOST_ADDRESS_READABLE ]
            ]);
            let containerAndContentsHTMLStr: string = injectVariables(containerHTMLStr, emailContainerInjections);

            // Next, inject any mail configuration provided variables into the resulting containerSAndContentsHTMLStr.
            containerAndContentsHTMLStr = injectVariables(containerAndContentsHTMLStr, mailConfig.injectionVariables);
    
            // Finally, have juice inline all HTML provided in link and style tags.
            resolve(juice(containerAndContentsHTMLStr));
        });
    });
}


/**
 * Generates header links to various tabs of the website based off of a given app user type flag inside a given mail configuration.
 * @param mailConfig The mail configuration.
 * @return The generated header links for the given user type.
 */
function generateHeaderLinks(mailConfig: MailConfig): string {
    
    let headerLinks: string = '';

    // For deliverer.
    if (mailConfig.receiverAppUserType === AppUserType.Deliverer) {

        headerLinks += `
            <a href="` + process.env.HOST_ADDRESS + `/deliver">Delivery</a> |
            <a href="` + process.env.HOST_ADDRESS + `/deliveryCart">Delivery Cart</a> |
        `;
    }
    // For donor and receiver.
    else if (mailConfig.receiverAppUserType != null) {

        // For donor.
        if (mailConfig.receiverAppUserType === AppUserType.Donor) {
            headerLinks += `
                <a href="` + process.env.HOST_ADDRESS + `/donate">Donate</a> |
            `;
        }
        // For receiver.
        else {
            headerLinks += `
                <a href="` + process.env.HOST_ADDRESS + `/receive">Receive</a> |
            `;
        }

        headerLinks += `
            <a href="` + process.env.HOST_ADDRESS + `/foodListingCart">Food Cart</a> |
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
