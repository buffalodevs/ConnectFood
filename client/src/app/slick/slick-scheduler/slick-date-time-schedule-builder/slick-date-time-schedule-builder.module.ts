import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatButtonModule, MatRadioModule, MatExpansionModule } from '@angular/material';

import { CommonUtilModule } from '../../../common-util/common-util.module';
import { SlickInputGroupModule } from '../../slick-input-group/slick-input-group.module';
import { SlickTypeaheadModule } from '../../slick-type-ahead/slick-type-ahead.module';
import { SlickExpansionPanelModule } from '../../../slick/slick-expansion-panel/slick-expansion-panel.module';

import { SlickTimeRangeModule } from '../../slick-date-time/slick-time-range/slick-time-range.module';
import { SlickDateTimeScheduleBuilderComponent } from './slick-date-time-schedule-builder.component';


@NgModule({
    declarations: [
        SlickDateTimeScheduleBuilderComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatRadioModule,
        MatExpansionModule,
        CommonUtilModule,
        SlickTimeRangeModule,
        SlickExpansionPanelModule,
        SlickTypeaheadModule,
        SlickInputGroupModule
    ],
    exports: [
        SlickDateTimeScheduleBuilderComponent
    ]
})
export class SlickDateTimeScheduleBuilderModule {}
