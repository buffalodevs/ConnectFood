import * as _ from 'lodash';
import { Component, ViewChild, forwardRef, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ImageCropperComponent, CropperSettings, CropPosition } from 'ng2-img-cropper';
import { NgxGalleryOptions, NgxGalleryComponent } from 'ngx-gallery';
import { SlickImg, ImgData, ImgCrop } from './slick-img';
import { DomSanitizer } from '@angular/platform-browser';


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
    @ViewChild('addImageButton') public addImageButton: HTMLButtonElement;
    @ViewChild('delImageButton') public delImageButton: HTMLButtonElement;

    public slickImgs: SlickImg[] = [];
    public showProgressSpinner: boolean = false;
    public activeImageIdx: number = 0;

    private onChange: (slickImgs: SlickImg[]) => void = () => {}; // If model not bound to from parent, simply swallow all changes here.


    public constructor (
        private _sanitizer: DomSanitizer
    ) {}


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
                thumbnailsMoveSize: this.thumbnailsColumns,
                lazyLoading: true
            }];
        }

        // If we are provided imgData array directly, then generate slickImg array with it.
        if (this.imgData != null) {
            this.initSlickImgsFromImgData();
        }

        this.refreshGalleryImages(this.slickImgs);
        this.changeImageSelection(0);
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
     * Triggered whenever an image file is added.
     * NOTE: Will be recursively called if multiple images are updated at once.
     * @param event The image file add event.
     * @param fileInput A reference to the file input (so we can reset its value when finished to allow duplicate upload and potentially save memory).
     * @param fileIdx The index of the image file that shall be worked with (default is 0).
     *                NOTE: should only be internally set when recursively called.
     */
    public addImagesListener(event: any, fileInput: HTMLInputElement, fileIdx: number = 0): void {

        // If we have no files to add, then simply jump out immediately.
        if (event.target.files.length === 0 || event.target.files[0] == null) return;
        this.setAddDelButtonsEnabled(false);
        
        // Use reader to convert file image format to renderable HTML Image format.
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (loadEvent: any) => {

            // Generate not Food Listing Image object and set its imageFile member.
            const newSlickImg = new SlickImg();
            newSlickImg.imgFile = event.target.files[fileIdx];
            
            // Set gallery image data. In edit mode, since we are not displaying medium and big gallery images, we will set these to dummy values (cannot be null).
            newSlickImg.small = loadEvent.target.result;
            newSlickImg.medium = loadEvent.target.result;
            newSlickImg.big = loadEvent.target.result;

            // NOTE: Important to add to array after done setting internal gallery image (small, medium, big) data so change detection occurs.
            this.slickImgs.push(newSlickImg);
            // Update selected image to the latest one added.
            this.changeImageSelection(this.slickImgs.length - 1);

            // If we have more files to recursively analyze and display.
            if (fileIdx < event.target.files.length - 1) {

                setTimeout(() => this.addImagesListener(event, fileInput, ++fileIdx), 1);
            }
            // Else, we have reached end of files to recursively analyze and add, so notify parent component of change and cleanup.
            else {

                fileInput.value = null; // Allow user to input same file twice and clear out memory used by input.
                this.setAddDelButtonsEnabled(true);
                this.onChange(this.slickImgs);
            }
        };
        myReader.readAsDataURL(event.target.files[fileIdx]);
    }


    /**
     * Sets the enabled status of the add and delete buttons.
     * @param enable The enable status (true for enabled, false for disabled).
     */
    private setAddDelButtonsEnabled(enable: boolean): void {

        if (this.addImageButton != null)    this.addImageButton.disabled = !enable;
        if (this.delImageButton != null)    this.delImageButton.disabled = !enable;
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

        this.changeImageSelection(activeImageIdxUpdt);
    }


    /**
     * Invoked whenever there is a change in image selection (by selecting gallery thumbnail image).
     * @param index The index of the new image to select.
     */
    public changeImageSelection(index: number): void {

        if (this.editMode && this.cropper) {

            // If we have an image to set in our Slick Img data arr.
            if (this.slickImgs.length > index) {
                
                const htmlImage: HTMLImageElement = new Image();
                htmlImage.src = this.slickImgs[index].big;
                this.cropper.setImage(htmlImage);
    
                // Only set cropper position if our slick image data has already been cropped (else we are selecting a new image).
                const selImgCrop: ImgCrop = this.slickImgs[index].imgData.imgCrop;
                if (selImgCrop.width != null) {
                    this.cropper.cropPosition = new CropPosition (
                        selImgCrop.left + 0.001, // NOTE: Added 0.001 forces crop bound to update (if left to original cropLeft, then won't update).
                        selImgCrop.top + 0.001,
                        selImgCrop.width,
                        selImgCrop.height
                    );
                }
            }
            // Else if the cropper has an image, then clear it.
            else if (this.cropper.image != null) {
                this.cropper.reset();
            }
        }

        this.activeImageIdx = index;
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

        // Update gallery images (NOTE: We need to refresh array reference in order to enforce change detection).
        //this.gallery.currentOptions.startIndex = this.activeImageIdx;
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
        this.changeImageSelection(0);
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
