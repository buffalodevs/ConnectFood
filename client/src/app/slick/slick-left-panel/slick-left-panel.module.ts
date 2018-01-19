import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { SlickLeftPanelComponent } from './slick-left-panel.component';
import { SlickScrollableStickyModule } from '../slick-scrollable-sticky/slick-scrollable-sticky.module';


@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        SlickScrollableStickyModule
    ],
    declarations: [
        SlickLeftPanelComponent
    ],
    exports: [
        SlickLeftPanelComponent
    ]
})
export class SlickLeftPanelModule {}
