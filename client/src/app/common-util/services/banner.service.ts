import { Injectable } from '@angular/core';


/**
 * Container for information pertaining to the global main banner placed within the header.
 * NOTE: Setting its properties during initialization of a component that has been routed to will change the banner to reflect the contained properties.
 */
@Injectable()
export class BannerService {

    public imgUrl: string;
    public heightPx: number;


    public constructor() {
        this.reset();
    }


    /**
     * Resets the banner properties to their original values (Where no banner will be displaying).
     */
    public reset(): void {
        this.imgUrl = null;
        this.heightPx = 680;
    }
}
