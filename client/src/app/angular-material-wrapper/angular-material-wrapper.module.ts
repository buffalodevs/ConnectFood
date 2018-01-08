import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatStepperModule,
         MatProgressSpinnerModule,
         MatCheckboxModule,
         MatRadioModule,
         MatButtonModule,
         MatInputModule,
         MatSelectModule,
         MatDatepickerModule,
         MatNativeDateModule,
         MatTooltipModule,
         MatExpansionModule,
         DateAdapter,
         NativeDateAdapter,
         MAT_DATE_FORMATS,
         MAT_NATIVE_DATE_FORMATS, 
         MatDialogModule } from '@angular/material';

import { SlickExpansionPanelModule } from './slick-expansion-panel/slick-expansion-panel.module';
import { SlickAutoCompleteInputModule } from './slick-auto-complete-input/slick-auto-complete-input.module';


@NgModule({
    imports: [
        CommonModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTooltipModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatExpansionModule,
        SlickExpansionPanelModule,
        SlickAutoCompleteInputModule
    ],
    exports: [
        MatStepperModule,
        MatProgressSpinnerModule,
        MatCheckboxModule,
        MatRadioModule,
        MatTooltipModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatDatepickerModule,
        MatDialogModule,
        MatNativeDateModule,
        SlickExpansionPanelModule,
        SlickAutoCompleteInputModule
    ],
    providers: [
        { provide: DateAdapter, useClass: NativeDateAdapter },
        { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }
    ]
})
export class AngularMaterialWrapperModule {}
