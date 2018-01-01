import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickLeftPanelModule } from './slick-left-panel/slick-left-panel.module'
import { SlickListModule } from './slick-list/slick-list.module';
import { SlickFilteredListComponent } from './slick-filtered-list.component';
import { GetListingsService } from './slick-list/get-listings.service';


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
    ],
    providers: [
        GetListingsService
    ]
})
export class SlickFilteredListModule {}
