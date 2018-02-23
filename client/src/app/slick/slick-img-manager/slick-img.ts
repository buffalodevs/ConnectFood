import { NgxGalleryImage } from "ngx-gallery";
import { ImgData, ImgCrop } from "../../../../../shared/src/img/img-data";
export { ImgData, ImgCrop };


export class SlickImg implements NgxGalleryImage {

    public constructor (
        public imgData: ImgData = new ImgData(), // Default initialize so accessing won't cause null pointer exception!
        public imgFile: File = null,
        public small: string = null,
        public medium: string = null,
        public big: string = null
    ) {}
}
