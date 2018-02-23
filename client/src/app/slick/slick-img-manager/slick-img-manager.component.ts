import * as _ from 'lodash';
import { Component, ViewChild, forwardRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImageCropperComponent, CropperSettings, CropPosition } from 'ng2-img-cropper';
import { NgxGalleryOptions, NgxGalleryComponent } from 'ngx-gallery';
import { SlickImg, ImgData, ImgCrop } from './slick-img';


@Component({
    selector: 'slick-img-manager',
    templateUrl: 'slick-img-manager.component.html',
    styleUrls: ['slick-img-manager.component.css'],
    providers: [
        SlickImgManagerComponent,
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => SlickImgManagerComponent),
        }
    ]
})
export class SlickImgManagerComponent implements ControlValueAccessor, OnInit, OnChanges {

    @Input() public defaultImgUrl: string = null;
    @Input() public editMode: boolean = false;
    @Input() public galleryOptions: NgxGalleryOptions[] = null;
    @Input() public cropperSettings: CropperSettings = null;
    @Input() public galleryWidth: number = 320;
    @Input() public galleryHeight: number = 467;
    @Input() public thumbnailsColumns: number = 3;
    @Input() public croppedWidth: number = 300;
    @Input() public croppedHeight: number = 300;
    @Input() public thresholdCropperWidth: number = 367;
    @Input() public imgData: ImgData[] = null;
    @Input() public showNoImgsIndicator: boolean = true;

    @ViewChild('cropper') public cropper: ImageCropperComponent;
    @ViewChild('gallery') public gallery: NgxGalleryComponent;

    public slickImgs: SlickImg[] = [];
    public showProgressSpinner: boolean = false;
    public activeImageIdx: number = 0;

    private onChange: (slickImgs: SlickImg[]) => void = () => {}; // If model not bound to from parent, simply swallow all changes here.


    public constructor() {}


    public ngOnInit(): void {

        if (this.cropperSettings == null) {

            this.cropperSettings = new CropperSettings();

            // If the window size goes below this threshold, then the cropper must be initialized below the optimal size of 300px.
            const thresholdCropperWidth: number = this.thresholdCropperWidth;
            this.cropperSettings.width = (window.innerWidth < thresholdCropperWidth ? this.croppedWidth - (thresholdCropperWidth - window.innerWidth)
                                                                                    : this.croppedHeight);
            this.cropperSettings.height = this.cropperSettings.width;
            this.cropperSettings.croppedWidth = this.croppedWidth;
            this.cropperSettings.croppedHeight = this.croppedHeight;
            this.cropperSettings.canvasWidth = (this.cropperSettings.width + 20);
            this.cropperSettings.canvasHeight = this.cropperSettings.height;
            this.cropperSettings.noFileInput = true;
            this.cropperSettings.fileType = 'image/jpeg';
        }

        if (this.galleryOptions == null) {

            this.galleryOptions = [{
                width: ( this.galleryWidth + 'px' ),
                height: ( this.galleryHeight + 'px' ),
                imagePercent: 100,
                imageInfinityMove: true,
                previewCloseOnClick: true,
                previewCloseOnEsc: true,
                previewSwipe: true,
                previewFullscreen: true,
                previewKeyboardNavigation: true,
                previewInfinityMove: true,
                previewZoom: true,
                thumbnailsSwipe: true,
                thumbnailsColumns: this.thumbnailsColumns,
                thumbnailsPercent: ( 100 / this.thumbnailsColumns ),
                thumbnailsMoveSize: this.thumbnailsColumns
            }];
        }

        // If we are provided imgData array directly, then generate slickImg array with it.
        if (this.imgData != null) {
            this.initSlickImgsFromImgData();
        }

        this.refreshGalleryImages(this.slickImgs);
        this.refreshActiveIdx();
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // If we change from non-edit to edit mode.
        if (changes.editMode && changes.editMode.currentValue === true && changes.editMode.previousValue === false) {

            // TODO: Handle change into edit mode.
        }
    }


    private initSlickImgsFromImgData(): void {

        this.slickImgs = [];
        for (let i: number = 0; i < this.imgData.length; i++) {
            this.slickImgs.push(new SlickImg);
            this.slickImgs[i].imgData = this.imgData[i];
        }
    }


    /**
     * Refreshes the contained gallery images based on given image crop data.
     * @param slickImgs The image crops to use to refresh the gallery images (contains URLs and crop boundaries).
     */
    private refreshGalleryImages(slickImgs: SlickImg[]): void {

        // Refresh gallery images based on given imgCrops URL values.
        for (let i: number = 0; i < this.slickImgs.length; i++) {

            this.slickImgs[i].small = slickImgs[i].imgData.getCropImgUrl();
            this.slickImgs[i].medium = slickImgs[i].imgData.getCropImgUrl();
            this.slickImgs[i].big = ( slickImgs[i].imgData.fullImgUrl );
        }
    }


    /**
     * Refreshes the active gallery image index to 0.
     */
    public refreshActiveIdx(): void {

        // Make sure that we reset the selected image to index 0.
        if (this.slickImgs.length !== 0) {

            this.imageSelectionChanged({
                index: 0,
                image: this.slickImgs[0]
            });

            // TODO: Crop the images displayed in image gallery.

            // const galleryBackgroundImgWidth: number= this.calcGalleryBackgroundImgWidth(this.imgCrops[0]);
            // const galleryBackgroundImgHeight: number = this.calcGalleryBackgroundImgHeight(this.imgCrops[0]);
            
            // background-position: 0 -50px;
            // background-size: 300px 100px;
        }
        this.activeImageIdx = 0;
    }


    private calcGalleryBackgroundImgWidth(imgCrop: ImgCrop): number {

        const imgDisplayToCropProp: number = ( this.galleryWidth / imgCrop.width );
        return ( imgCrop.width * imgDisplayToCropProp );
    }


    private calcGalleryBackgroundImgHeight(imgCrop: ImgCrop): number {

        const imgDisplayToCropProp: number = ( this.galleryHeight / imgCrop.height );
        return ( imgCrop.height * imgDisplayToCropProp );
    }


    /**
     * Triggered whenever an image file is added.
     * @param event The image file add event.
     */
    public addImageListener(event: any, fileInput: HTMLInputElement): void {

        // When adding an image is selected, user can hit cancel in file selector.
        if (event.target.files[0] == null) return;

        // Ensure we locally store this so we refer to correct index in onloadend cb below!
        // IMPORTANT: We must update the instance activeImageIdx value in the cb below in order to avoid a race condition with the cropper (cannot update here)!!!
        const activeImageIdxUpdt: number = this.slickImgs.length;

        // Use reader to convert file image format to renderable HTML Image format.
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (loadEvent: any) => {

            // Generate not Food Listing Image object and set its imageFile member.
            this.slickImgs.push(new SlickImg());
            this.slickImgs[activeImageIdxUpdt].imgFile = event.target.files[0];

            const image: HTMLImageElement = new Image();
            image.src = loadEvent.target.result;

            this.slickImgs[activeImageIdxUpdt].small = image.src;
            this.slickImgs[activeImageIdxUpdt].medium = image.src;
            this.slickImgs[activeImageIdxUpdt].big = image.src;

            this.activeImageIdx = activeImageIdxUpdt;
            this.cropper.cropPosition = null;
            this.cropper.setImage(image);

            fileInput.value = null; // Allow user to input same file twice.
        };
        myReader.readAsDataURL(event.target.files[0]);

        // Notify parent of added image.
        this.onChange(this.slickImgs);
    }


    /**
     * Listens for Remove Image Button click and removes the current active image.
     */
    public delImageListener(): void {

        // Remove all data associated with image.
        this.slickImgs.splice(this.activeImageIdx, 1);

        // Determine the new active image index (set it to element immediately after removed element if possible).
        const activeImageIdxUpdt: number = ( this.activeImageIdx >= this.slickImgs.length ) ? (this.slickImgs.length > 0) ? this.slickImgs.length - 1
                                                                                                                          : 0
                                                                                            : this.activeImageIdx;

        this.imageSelectionChanged({
            index: activeImageIdxUpdt,
            image: this.slickImgs[activeImageIdxUpdt]
        });
    }


    /**
     * Invoked whenever there is a change in image selection (by selecting gallery thumbnail image).
     * @param change The change that has occured.
     */
    public imageSelectionChanged(change: { index: number, image: SlickImg }): void {

        if (this.editMode) {

            if (this.slickImgs[change.index] != null && this.slickImgs[change.index].big != null) {

                // Set the cropper image.
                const image: HTMLImageElement = new Image();
                image.src = <string>(this.slickImgs[change.index].big);
                this.cropper.setImage(image);

                // Set the crop bounds for the new cropper image.
                const selImgCrop: ImgCrop = this.slickImgs[change.index].imgData.imgCrop;
                this.cropper.cropPosition = new CropPosition (
                    selImgCrop.left + 0.001, // NOTE: Added 0.001 forces crop bound to update (if left to original cropLeft, then won't update).
                    selImgCrop.top + 0.001,
                    selImgCrop.width,
                    selImgCrop.height
                );
            }
            else {
                this.cropper.reset();
            }
        }

        this.activeImageIdx = change.index;
    }


    /**
     * Invoked by the image cropper whenever the contained image is newly cropped.
     * @param cropBounds The crop bounds for the current cropper image.
     */
    public imageCropped(cropBounds: ImgCrop): void {

        // Update boandaries held for the image that is being cropped.
        this.slickImgs[this.activeImageIdx].imgData.imgCrop = cropBounds;

        const slickImgUpdt: SlickImg = this.slickImgs[this.activeImageIdx];
        slickImgUpdt.small = this.slickImgs[this.activeImageIdx].imgData.imgCropBase64Upload.image;
        slickImgUpdt.medium = this.slickImgs[this.activeImageIdx].imgData.imgCropBase64Upload.image;
        slickImgUpdt.big = this.slickImgs[this.activeImageIdx].big;

        // Update gallery images (NOTE: We need to refresh array reference in order to enforce change detection).
        this.gallery.currentOptions.startIndex = this.activeImageIdx;
        this.slickImgs = this.slickImgs.slice(0, this.activeImageIdx)
                                       .concat(slickImgUpdt)
                                       .concat(this.slickImgs.slice(this.activeImageIdx + 1));

        this.onChange(this.slickImgs);
    }


    public writeValue(slickImgs: SlickImg[]): void {

        this.slickImgs = (slickImgs != null) ? slickImgs
                                             : [];

        // If we are writing a value internally when user added image, then no need to continue refresh (will cause error if we do b/c imgUrl not set for imgCrop yet).
        if (this.slickImgs.length > 0 && this.slickImgs[0].imgData.fullImgUrl == null)
        { return; }

        this.refreshGalleryImages(this.slickImgs);
        this.refreshActiveIdx();
    }


    public registerOnChange(onChange: (slickImgs: SlickImg[]) => void): void {
        this.onChange = onChange;
    }


    public registerOnTouched(fn: any): void {}


    public getImgManagerMaxHeight(): number {

        return this.editMode ? ( this.cropperSettings.height + (this.galleryHeight / 3) + 40 ) // +40 for button height
                             : this.galleryHeight;
    }
}
