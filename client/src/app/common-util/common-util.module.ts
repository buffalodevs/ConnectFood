import { NgModule } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TextMaskModule } from 'angular2-text-mask';
import { LoggerModule, NgxLoggerLevel, LoggerConfig } from 'ngx-logger';

import { SlickProgressSpinnerModule } from '../slick/slick-progress-spinner/slick-progress-spinner.module';
import { DateFormatterPipe } from './pipes/date-formatter.pipe';
import { NumRangePipe } from './pipes/num-range.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DefaultImgDirective } from './directives/default-img.directive';
import { InputFilterDirective } from './directives/input-filter.directive';

import { RequestService } from './services/request.service';
import { RoutePreprocessService } from './services/route-preprocess.service';
import { SessionDataService } from './services/session-data.service';
import { ResponsiveService } from './services/responsive.service';
import { ValidationService } from './services/validation.service';
import { DateFormatterService } from './services/date-formatter.service';
import { DeserializerService } from './services/deserializer.service';
import { RequestResponseLoggerService } from './services/logging/request-response-logger.service';


console.log('Production: ' + environment.production);


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
        SlickProgressSpinnerModule,
        LoggerModule.forRoot({
            level: environment.production ? NgxLoggerLevel.OFF      // Do not want to log to user's browser console.
                                          : NgxLoggerLevel.TRACE,   // Want to log everything to developer's console.
            serverLoggingUrl: '/logging/logClientData',
            serverLogLevel: NgxLoggerLevel.WARN // Want to send all warn and error messages to the server to be logged.
        })
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
        DateFormatterService,
        DeserializerService,
        RequestResponseLoggerService
    ]
})
export class CommonUtilModule {}
