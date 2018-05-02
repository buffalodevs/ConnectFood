import { SessionData } from "../common-util/session-data";


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
