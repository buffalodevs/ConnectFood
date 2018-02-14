import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule, MatButtonModule, MatStepperModule, MatRadioModule } from '@angular/material';

import { CommonUtilModule } from '../common-util/common-util.module';
import { SlickTypeaheadModule } from '../slick/slick-type-ahead/slick-type-ahead.module';
import { SlickInputGroupModule } from '../slick/slick-input-group/slick-input-group.module';
import { SlickWeekdayScheduleBuilderModule } from '../slick/slick-scheduler/slick-weekday-schedule-builder/slick-weekday-schedule-builder.module';

import { LoginComponent } from './login/login.component';
import { LoginRequiredComponent } from './login-required/login-required.component';
import { SignupComponent } from './signup/signup.component';
import { AppUserInfoComponent } from './app-user-info/app-user-info.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { AppUserConstantsService } from './common-app-user/app-user-constants.service';
import { AppUserValidationService } from './common-app-user/app-user-validation.service';


const appUserRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'loginRequired',
        component: LoginRequiredComponent
    },
    {
        path: 'signup',
        component: SignupComponent,
        canActivate: [RoutePreprocessService]
    },
    {
        path: 'appUserInfo',
        component: AppUserInfoComponent,
        canActivate: [RoutePreprocessService]
    }
];


@NgModule({
    declarations: [
        LoginComponent,
        LoginRequiredComponent,
        SignupComponent,
        AppUserInfoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(appUserRoutes),
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatStepperModule,
        MatRadioModule,
        CommonUtilModule,
        SlickTypeaheadModule,
        SlickInputGroupModule,
        SlickWeekdayScheduleBuilderModule
    ],
    entryComponents: [
        LoginComponent
    ],
    providers: [
        AppUserConstantsService,
        AppUserValidationService
    ]
})
export class AppUserModule {}
