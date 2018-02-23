import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';

import { ImageCropperModule } from 'ng2-img-cropper';
import { NgxGalleryModule } from 'ngx-gallery';

import { SlickImgManagerComponent } from './slick-img-manager.component';


@NgModule({
    declarations: [
        SlickImgManagerComponent
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        ImageCropperModule,
        NgxGalleryModule
    ],
    exports: [
        SlickImgManagerComponent
    ]
})
export class SlickImgManagerModule {}
