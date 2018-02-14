import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SlickTimeModule } from '../slick-time/slick-time.module';
import { SlickDatePickerModule } from '../slick-date-picker/slick-date-picker.module';
import { SlickTimeRangeComponent } from './slick-time-range.component';


@NgModule({
    declarations: [
        SlickTimeRangeComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SlickTimeModule,
        SlickDatePickerModule
    ],
    exports: [
        SlickTimeRangeComponent
    ]
})
export class SlickTimeRangeModule {}
