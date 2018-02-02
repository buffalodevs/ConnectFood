import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material';

import { SlickExpansionPanelDirective } from './slick-expansion-panel.directive';


@NgModule({
    declarations: [
        SlickExpansionPanelDirective
    ],
    imports: [
        CommonModule,
        MatExpansionModule
    ],
    exports: [
        SlickExpansionPanelDirective
    ]
})
export class SlickExpansionPanelModule {}
