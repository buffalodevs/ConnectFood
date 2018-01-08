import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material';

import { SlickExpansionPanelComponent } from './slick-expansion-panel.component';


@NgModule({
    declarations: [
        SlickExpansionPanelComponent
    ],
    imports: [
        CommonModule,
        MatExpansionModule
    ],
    exports: [
        SlickExpansionPanelComponent
    ]
})
export class SlickExpansionPanelModule {}
