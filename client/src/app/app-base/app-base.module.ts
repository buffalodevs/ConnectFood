import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatButtonModule } from '@angular/material';

import { CommonUtilModule } from '../common-util/common-util.module';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { BannerService } from '../common-util/services/banner.service';
import { SlickDateTimeScheduleBuilderModule } from '../slick/slick-scheduler/slick-date-time-schedule-builder/slick-date-time-schedule-builder.module';


const appBaseRoutes: Routes = [
    {
        path: 'home',
        component: HomeComponent
    }
];


@NgModule({
    declarations: [
        HeaderComponent,
        FooterComponent,
        HomeComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(appBaseRoutes),
        NgbModule,
        MatButtonModule,
        CommonUtilModule,
        SlickDateTimeScheduleBuilderModule
    ],
    exports: [
        HeaderComponent,
        FooterComponent
    ],
    providers: [
        BannerService
    ]
})
export class AppBaseModule {}
