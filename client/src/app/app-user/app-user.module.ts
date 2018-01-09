import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';
import { SlickTypeaheadModule } from '../misc-slick-components/slick-type-ahead/type-ahead.module';
import { SlickInputGroupModule } from '../misc-slick-components/slick-input-group/slick-input-group.module';
import { SlickWeekdaySchedulerModule } from '../misc-slick-components/slick-weekday-scheduler/slick-weekday-scheduler.module';

import { LoginComponent } from './login/login.component';
import { LoginRequiredComponent } from './login-required/login-required.component';
import { SignupComponent } from './signup/signup.component';
import { AppUserInfoComponent } from './app-user-info/app-user-info.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { AppUserConstantsService } from './common-app-user/app-user-constants.service';
import { AppUserValidationService } from './common-app-user/app-user-validation.service';
import { AppUserTypesService } from '../domain/app-user-types/app-user-types.service';


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
        canActivate: [RoutePreprocessService],
        // Make sure that we get the App User Types from the server before routing to the signup interface!
        resolve: {
            appUserTypes: AppUserTypesService
        }
    },
    {
        path: 'appUserInfo',
        component: AppUserInfoComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the App User Types from the server before routing to the signup interface!
        resolve: {
            appUserTypes: AppUserTypesService
        }
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
        CommonUtilModule,
        AngularMaterialWrapperModule,
        SlickTypeaheadModule,
        SlickInputGroupModule,
        SlickWeekdaySchedulerModule
    ],
    entryComponents: [
        LoginComponent
    ],
    providers: [
        AppUserConstantsService,
        AppUserValidationService,
        AppUserTypesService
    ]
})
export class AppUserModule {}
