import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BusyModule } from 'angular2-busy';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';

import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AppUserInfoComponent } from './app-user-info/app-user-info.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { CommonModule } from '@angular/common';


const appUserRoutes: Routes = [
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
        SignupComponent,
        AppUserInfoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(appUserRoutes),
        FormsModule,
        ReactiveFormsModule,
        BusyModule,
        CommonUtilModule,
        AngularMaterialWrapperModule
    ],
    entryComponents: [
        LoginComponent
    ]
})
export class AppUserModule { }
