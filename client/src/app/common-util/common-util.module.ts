import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TextMaskModule } from 'angular2-text-mask';

import { SlickProgressSpinnerModule } from '../slick/slick-progress-spinner/slick-progress-spinner.module';
import { DateFormatterPipe } from './pipes/date-formatter.pipe';
import { NumRangePipe } from './pipes/num-range.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DefaultImgDirective } from './directives/default-img.directive';
import { InputFilterDirective } from './directives/input-filter.directive';

import { RequestService } from './services/request.service';
import { RoutePreprocessService } from './services/route-preprocess.service';
import { SessionDataService } from './services/session-data.service';
import { GetDomainValuesService } from '../domain/get-domain-values.service';
import { ResponsiveService } from './services/responsive.service';
import { ValidationService } from './services/validation.service';
import { DateFormatterService } from './services/date-formatter.service';


@NgModule({
    declarations: [
        DateFormatterPipe,
        NumRangePipe,
        AutoFocusDirective,
        DefaultImgDirective,
        InputFilterDirective
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        TextMaskModule,
        SlickProgressSpinnerModule
    ],
    exports: [
        DateFormatterPipe,
        AutoFocusDirective,
        DefaultImgDirective,
        InputFilterDirective,
        TextMaskModule,
        SlickProgressSpinnerModule
    ],
    providers: [
        DateFormatterPipe,
        NumRangePipe,
        RequestService,
        RoutePreprocessService,
        SessionDataService,
        ResponsiveService,
        ValidationService,
        DateFormatterService
    ]
})
export class CommonUtilModule {}
