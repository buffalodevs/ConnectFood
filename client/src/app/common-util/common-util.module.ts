import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { MdProgressSpinnerModule } from '@angular/material';

import { SlickProgressSpinnerComponent } from './components/slick-progress-spinner/slick-progress-spinner.component';
import { DateFormatterPipe } from './pipes/date-formatter.pipe';
import { NumRangePipe } from './pipes/num-range.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DefaultImgDirective } from './directives/default-img.directive';
import { InputFilterDirective } from './directives/input-filter.directive';

import { GeocodeService } from './services/geocode.service';
import { RequestService } from './services/request.service';
import { RoutePreprocessService } from './services/route-preprocess.service';
import { SessionDataService } from './services/session-data.service';
import { GetDomainValuesService } from '../domain/get-domain-values.service';
import { ResponsiveService } from './services/responsive.service';
import { ValidationService } from './services/validation.service';


@NgModule({
    declarations: [
        SlickProgressSpinnerComponent,
        DateFormatterPipe,
        NumRangePipe,
        AutoFocusDirective,
        DefaultImgDirective,
        InputFilterDirective
    ],
    imports: [
        CommonModule,
        HttpModule,
        MdProgressSpinnerModule
    ],
    exports: [
        SlickProgressSpinnerComponent,
        DateFormatterPipe,
        AutoFocusDirective,
        DefaultImgDirective,
        InputFilterDirective
    ],
    providers: [
        DateFormatterPipe,
        NumRangePipe,
        GeocodeService,
        RequestService,
        RoutePreprocessService,
        SessionDataService,
        ResponsiveService,
        ValidationService
    ]
})
export class CommonUtilModule {}
