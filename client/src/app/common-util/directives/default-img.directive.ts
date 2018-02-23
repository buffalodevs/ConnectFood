import { Directive, Input } from '@angular/core';


export const DEFAULT_IMG_URL: string = './../assets/IconImg.png';


/**
 * Defines default image behavior when an image is not provided or does not exist (resulting in handled error).
 */
@Directive({
    selector: '[DefaultImg]',
    host: {
        '[src]': 'checkPath(src)',
        '(error)': 'onError()'
    }
})
export class DefaultImgDirective { 

    @Input() src: string;


    /**
     * Activated whenever an error occurs, and assigns the default image in response.
     */
    public onError(): void {
        this.src = DEFAULT_IMG_URL;
    }


    /**
     * Activated when any input data binding is established with the src attribute of host img tag.
     * @param src The source image url.
     * @return The url of the image to be displayed. If src input is null, then the default is displayed. Otherwise, src is simply displayed.
     */
    public checkPath(src): string {
        return (src != null) ? src : DEFAULT_IMG_URL;
    }
}
