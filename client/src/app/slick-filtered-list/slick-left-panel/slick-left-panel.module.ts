import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule } from '@angular/material';

import { SlickLeftPanelComponent } from './slick-left-panel.component'


@NgModule({
    imports: [
        CommonModule,
        MdButtonModule
    ],
    declarations: [
        SlickLeftPanelComponent
    ],
    exports: [
        SlickLeftPanelComponent
    ]
})
export class SlickLeftPanelModule { }
