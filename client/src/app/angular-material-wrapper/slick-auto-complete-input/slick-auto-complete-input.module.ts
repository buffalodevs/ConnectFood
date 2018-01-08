import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatAutocompleteModule } from '@angular/material';

import { CommonUtilModule } from '../../common-util/common-util.module';
import { SlickAutoCompleteInputComponent } from './slick-auto-complete-input.component';


@NgModule({
    declarations: [
        SlickAutoCompleteInputComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatAutocompleteModule,
        CommonUtilModule
    ],
    exports: [
        SlickAutoCompleteInputComponent
    ]
})
export class SlickAutoCompleteInputModule {}
