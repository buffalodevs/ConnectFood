import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { BannerService } from '../common-util/services/banner.service';


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
        BootstrapModalModule,
        CommonUtilModule,
        AngularMaterialWrapperModule
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
