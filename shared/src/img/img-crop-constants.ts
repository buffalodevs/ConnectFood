export class ImgCropConstants {

    public static readonly DEF_CROP_WIDTH: number = 300;
    public static readonly DEF_CROP_HEIGHT: number = 300;

    public constructor() {}


    public getDefCropWidth(): number {
        return ImgCropConstants.DEF_CROP_WIDTH;
    }


    public getDefCropHeight(): number {
        return ImgCropConstants.DEF_CROP_HEIGHT;
    }


    public getDefCropImgGalleryHeight(): number {
        return ( ImgCropConstants.DEF_CROP_HEIGHT + (ImgCropConstants.DEF_CROP_HEIGHT / 3) );
    }
}
