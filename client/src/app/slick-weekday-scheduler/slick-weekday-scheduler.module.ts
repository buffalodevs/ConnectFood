import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdInputModule } from '@angular/material';

import { CommonUtilModule } from '../common-util/common-util.module';
import { SlickTimeRangeComponent } from './slick-time-range/slick-time-range.component';
import { SlickWeekdaySchedulerComponent } from './slick-weekday-scheduler.component';
import { SlickAutoCompleteInputModule } from '../angular-material-wrapper/slick-auto-complete-input/slick-auto-complete-input.module';
import { SlickExpansionPanelModule } from '../angular-material-wrapper/slick-expansion-panel/slick-expansion-panel.module';
import { SlickInputGroupModule } from '../slick-input-group/slick-input-group.module';


@NgModule({
    declarations: [
        SlickTimeRangeComponent,
        SlickWeekdaySchedulerComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MdInputModule,
        CommonUtilModule,
        SlickAutoCompleteInputModule,
        SlickExpansionPanelModule,
        SlickInputGroupModule
    ],
    exports: [
        SlickWeekdaySchedulerComponent
    ]
})
export class SlickWeekdaySchedulerModule {}
