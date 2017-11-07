import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickLeftPanelModule } from './slick-left-panel/slick-left-panel.module'
import { SlickListModule } from './slick-list/slick-list.module';


@NgModule({
    imports: [
        CommonModule,
        SlickLeftPanelModule,
        SlickListModule
    ],
    exports: [
        SlickLeftPanelModule,
        SlickListModule
    ]
})
export class SlickFilteredListModule { }
