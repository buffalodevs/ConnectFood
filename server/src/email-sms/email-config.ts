import { AppUserType } from "../../../shared/src/app-user/app-user";


/**
 * Configuration object for sending an email.
 */
export class EmailConfig {

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
         * NOTE: Do NOT surround variable name key values in curly braces, because this is implicitly taken care of! Only use curly braces in HTML documents!
         */
        public injectionVariables: Map<string, any> = new Map<string, any>()
    ) {}
}
