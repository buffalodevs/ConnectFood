import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material';

import { CommonUtilModule } from '../../../common-util/common-util.module';
import { SlickInputGroupModule } from '../../slick-input-group/slick-input-group.module';
import { SlickTimeComponent } from './slick-time.component';
import { SlickTypeaheadModule } from '../../slick-type-ahead/slick-type-ahead.module';


@NgModule({
    declarations: [
        SlickTimeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        CommonUtilModule,
        SlickInputGroupModule,
        SlickTypeaheadModule
    ],
    exports: [
        SlickTimeComponent
    ]
})
export class SlickTimeModule {}
