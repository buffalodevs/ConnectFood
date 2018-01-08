import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material';

import { SlickLeftPanelComponent } from './slick-left-panel.component'


@NgModule({
    imports: [
        CommonModule,
        MatButtonModule
    ],
    declarations: [
        SlickLeftPanelComponent
    ],
    exports: [
        SlickLeftPanelComponent
    ]
})
export class SlickLeftPanelModule { }
