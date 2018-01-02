import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdButtonModule } from '@angular/material';

import { CommonUtilModule } from '../../../common-util/common-util.module';
import { SlickListComponent } from './slick-list.component';
import { SlickListItemComponent } from './slick-list-item/slick-list-item.component';
import { SlickListDialogComponent } from './slick-list-dialog/slick-list-dialog.component';


@NgModule({
    imports: [
        CommonModule,
        MdButtonModule,
        CommonUtilModule
    ],
    declarations: [
        SlickListComponent,
        SlickListItemComponent,
        SlickListDialogComponent
    ],
    exports: [
        SlickListComponent,
        SlickListItemComponent,
        SlickListDialogComponent
    ]
})
export class SlickListModule { }
