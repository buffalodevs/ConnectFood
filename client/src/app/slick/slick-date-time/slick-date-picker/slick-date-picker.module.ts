import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDatepickerModule,
         MatNativeDateModule,
         DateAdapter,
         NativeDateAdapter,
         MAT_DATE_FORMATS,
         MAT_NATIVE_DATE_FORMATS, 
         MatInputModule } from '@angular/material';


@NgModule({
    imports: [
        CommonModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
    ],
    exports: [
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule
    ],
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
    ]
})
export class SlickDatePickerModule {}
