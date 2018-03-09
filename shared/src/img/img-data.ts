import { deserializable } from "../deserialization/deserializer";
import { ImgCrop } from "./img-crop";
export { ImgCrop };


/**
 * Container for shared image data.
 */
@deserializable('ImgData')
export class ImgData {

    private static readonly _CROP_URL_PREFIX = 'crop_';
    /**
     * Generated using the contained fullImgUrl.
     */
    private _cropImgUrl: string;
    private _fullImgFileName: string;
    private _cropImgFileName: string;


    public constructor (
        /**
         * Crop boundaries for the image.
         */
        public imgCrop: ImgCrop = new ImgCrop(),
        /**
         * URL for full sized image (will be set by server after initial upload).
         * NOTE: Can generate cropped image's URL via ( ImgData.CROP_URL_PREFIX + fullImgUrl ).
         */
        public fullImgUrl: string = null,
        /**
         * Cropped image in base64 serialized string format that should only be present during image upload.
         */
        public imgCropBase64Upload: { image: string } = { image: null }
    ) {}


    /**
     * Gets the full image file name. If it has not yet been retrieved, then lazy genrates it on the fly.
     */
    public getFullImgFileName(): string {

        this._fullImgFileName = ( this._fullImgFileName != null ) ? this._fullImgFileName
                                                                  : this.genFullImgFileName();

        return this._fullImgFileName;
    }


    /**
     * Gets the cropped image file name. If it has not yet been retrieved, then lazy genrates it on the fly.
     */
    public getCropImgFileName(): string {

        this._cropImgFileName = ( this._cropImgFileName != null ) ? this._cropImgFileName
                                                                  : this.genCropImgFileName();

        return this._cropImgFileName;
    }


    /**
     * Gets the cropped image URL. If it has not yet been retrieved, then lazy generates it on the fly.
     */
    public getCropImgUrl(): string {

        this._cropImgUrl = ( this._cropImgUrl != null ) ? this._cropImgUrl
                                                        : this.genCropImgUrl();

        return this._cropImgUrl;
    }


    /**
     * Generates full image file name based on the contained fullImgUrl.
     */
    private genFullImgFileName(): string {

        if (this.fullImgUrl != null) {
            // Remove all directories from path (everything before and including each / or \ separator).
            return this.fullImgUrl.replace(/^.*[\\\/]/, '');
        }

        return null;
    }


    /**
     * Generates crop image file name based on the contained fullImgUrl.
     */
    private genCropImgFileName(): string {

        if (this.fullImgUrl != null) {
            // Remove all directories from path (everything before and including each / or \ separator).
            return ( ImgData._CROP_URL_PREFIX + this.fullImgUrl.replace(/^.*[\\\/]/, '') );
        }

        return null;
    }


    /**
     * Generate cropped image URL based on cotained fullImgUrl.
     */
    private genCropImgUrl(): string {

        let cropUrlImg: string = null;

        if (this.fullImgUrl != null) {
            
            const urlPathSplits: string[] = this.fullImgUrl.split(/[\\\/]/);
            cropUrlImg = '';

            for (let i: number = 0; i < urlPathSplits.length; i++) {

                cropUrlImg += ('/' + ((i < urlPathSplits.length - 1) ? urlPathSplits[i]
                                                                     : ( ImgData._CROP_URL_PREFIX + urlPathSplits[i] )));
            }
        }

        return cropUrlImg.substr(1); // Remove first '/'.
    }
}
