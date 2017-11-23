import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdExpansionModule } from '@angular/material';

import { SlickExpansionPanelComponent } from './slick-expansion-panel.component';


@NgModule({
    declarations: [
        SlickExpansionPanelComponent
    ],
    imports: [
        CommonModule,
        MdExpansionModule
    ],
    exports: [
        SlickExpansionPanelComponent
    ]
})
export class SlickExpansionPanelModule {}
