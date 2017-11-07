import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { DateFormatterPipe } from './pipes/date-formatter.pipe';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { DefaultImgDirective } from './directives/default-img.directive';
import { BannerComponent } from './banner/banner.component';

import { GeocodeService } from './services/geocode.service';
import { RequestService } from './services/request.service';
import { RoutePreprocessService } from './services/route-preprocess.service';
import { SessionDataService } from './services/session-data.service';
import { GetDomainValuesService } from '../domain/get-domain-values.service';


@NgModule({
    declarations: [
        DateFormatterPipe,
        AutoFocusDirective,
        DefaultImgDirective,
        BannerComponent
    ],
    imports: [
        CommonModule,
        HttpModule
    ],
    exports: [
        DateFormatterPipe,
        AutoFocusDirective,
        DefaultImgDirective,
        BannerComponent
    ],
    providers: [
        DateFormatterPipe,
        GeocodeService,
        RequestService,
        RoutePreprocessService,
        SessionDataService
    ]
})
export class CommonUtilModule { }
