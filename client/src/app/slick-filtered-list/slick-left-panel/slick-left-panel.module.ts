import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickLeftPanelComponent } from './slick-left-panel.component'


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SlickLeftPanelComponent
    ],
    exports: [
        SlickLeftPanelComponent
    ]
})
export class SlickLeftPanelModule { }
