import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MdStepperModule,
         MdProgressSpinnerModule,
         MdCheckboxModule,
         MdRadioModule,
         MdButtonModule,
         MdInputModule,
         MdSelectModule,
         MdDatepickerModule,
         MdNativeDateModule,
         MdTooltipModule,
         MdExpansionModule,
         DateAdapter,
         NativeDateAdapter,
         MD_DATE_FORMATS,
         MD_NATIVE_DATE_FORMATS } from '@angular/material';

import { SlickExpansionPanelModule } from './slick-expansion-panel/slick-expansion-panel.module';
import { SlickAutoCompleteInputModule } from './slick-auto-complete-input/slick-auto-complete-input.module';


@NgModule({
    imports: [
        CommonModule,
        MdStepperModule,
        MdProgressSpinnerModule,
        MdCheckboxModule,
        MdRadioModule,
        MdTooltipModule,
        MdInputModule,
        MdSelectModule,
        MdButtonModule,
        MdDatepickerModule,
        MdNativeDateModule,
        MdExpansionModule,
        SlickExpansionPanelModule,
        SlickAutoCompleteInputModule
    ],
    exports: [
        MdStepperModule,
        MdProgressSpinnerModule,
        MdCheckboxModule,
        MdRadioModule,
        MdTooltipModule,
        MdInputModule,
        MdSelectModule,
        MdButtonModule,
        MdDatepickerModule,
        MdNativeDateModule,
        SlickExpansionPanelModule,
        SlickAutoCompleteInputModule
    ],
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MD_DATE_FORMATS, useValue: MD_NATIVE_DATE_FORMATS }
    ]
})
export class AngularMaterialWrapperModule {}
