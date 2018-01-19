import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material';

import { SlickProgressSpinnerComponent } from './slick-progress-spinner.component';
import { SlickScrollableStickyModule } from '../slick-scrollable-sticky/slick-scrollable-sticky.module';


@NgModule({
    declarations: [
        SlickProgressSpinnerComponent
    ],
    imports: [
        CommonModule,
        MatProgressSpinnerModule,
        SlickScrollableStickyModule
    ],
    exports: [
        SlickProgressSpinnerComponent
    ]
})
export class SlickProgressSpinnerModule {}
