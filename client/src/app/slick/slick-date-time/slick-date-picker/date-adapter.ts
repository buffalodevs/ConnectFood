import { NativeDateAdapter } from "@angular/material";


/**
 * A date adapter with better error checking.
 */
export class SlickDateAdapter extends NativeDateAdapter {

    // TODO: Implement adapter so that we can invalidate when incorrect date string is entered!


    public constructor (
        matDateLocal: string
    ) {
        super(matDateLocal);

        throw new Error('Slick Date Adapter not implemented yet.');
    }
}
