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

import { SlickExpansionPanelComponent } from './slick-expansion-panel/slick-expansion-panel.component';


@NgModule({
    declarations: [
        SlickExpansionPanelComponent
    ],
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
        MdExpansionModule
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
        SlickExpansionPanelComponent
    ],
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MD_DATE_FORMATS, useValue: MD_NATIVE_DATE_FORMATS }
    ]
})
export class AngularMaterialWrapperModule { }
