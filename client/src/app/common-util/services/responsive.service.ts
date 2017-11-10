import { Injectable } from '@angular/core';


@Injectable()
export class ResponsiveService {

    public constructor() {}


    /**
     * If current client window width is greater than the given width cut off, then returns true.
     * @param widthCutOff The lower cut off of the width.
     */
    public widthGreaterThan(widthCutOff: number): boolean {
        return (widthCutOff < window.innerWidth);
    }
}
