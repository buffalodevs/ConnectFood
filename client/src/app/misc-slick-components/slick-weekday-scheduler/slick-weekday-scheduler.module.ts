import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule, MatRadioModule, MatExpansionModule } from '@angular/material';

import { CommonUtilModule } from '../../common-util/common-util.module';
import { SlickTimeRangeComponent } from './slick-weekday-schedule-builder/slick-time-range/slick-time-range.component';
import { SlickWeekdayScheduleBuilderComponent } from './slick-weekday-schedule-builder/slick-weekday-schedule-builder.component';
import { SlickWeekdaySchedulerComponent } from './slick-weekday-scheduler.component';
import { SlickAutoCompleteInputModule } from '../../angular-material-wrapper/slick-auto-complete-input/slick-auto-complete-input.module';
import { SlickExpansionPanelModule } from '../../angular-material-wrapper/slick-expansion-panel/slick-expansion-panel.module';
import { SlickInputGroupModule } from '../slick-input-group/slick-input-group.module';
import { WeekdaySplitService } from './scheduler-util/weekday-split.service';


@NgModule({
    declarations: [
        SlickTimeRangeComponent,
        SlickWeekdayScheduleBuilderComponent,
        SlickWeekdaySchedulerComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatRadioModule,
        MatExpansionModule,
        CommonUtilModule,
        SlickAutoCompleteInputModule,
        SlickExpansionPanelModule,
        SlickInputGroupModule
    ],
    exports: [
        SlickWeekdayScheduleBuilderComponent,
        SlickWeekdaySchedulerComponent
    ],
    providers: [
        WeekdaySplitService
    ]
})
export class SlickWeekdaySchedulerModule {}
