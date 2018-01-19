import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickLeftPanelModule } from '../slick-left-panel/slick-left-panel.module'
import { SlickListModule } from './slick-list/slick-list.module';
import { SlickFilteredListComponent } from './slick-filtered-list.component';


@NgModule({
    declarations: [
        SlickFilteredListComponent
    ],
    imports: [
        CommonModule,
        SlickLeftPanelModule,
        SlickListModule
    ],
    exports: [
        SlickFilteredListComponent,
        SlickLeftPanelModule,
        SlickListModule
    ]
})
export class SlickFilteredListModule {}
