import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpModule } from '@angular/http'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { ImageCropperModule } from 'ng2-img-cropper';
import { BusyModule } from 'angular2-busy';
import { AngularMaterialWrapperModule } from './angular-material-wrapper/angular-material-wrapper.module';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './authentication/login/login.component';
import { DonateComponent } from './donate/donate.component';
import { ReceiveComponent } from './receive/receive.component';
import { CartComponent } from './cart/cart.component';
import { SignupComponent } from './authentication/signup/signup.component';
import { BannerComponent } from './banner/banner.component';
import { SlickLeftPanelComponent } from './slick-left-panel/slick-left-panel.component';
import { SlickListModule } from './slick-list/slick-list.module';
import { SlickMapComponent } from './slick-map/slick-map.component';
import { FoodListingsFiltersComponent } from './food-listings/food-listings-filters/food-listings-filters.component';
import { FoodListingsComponent } from './food-listings/food-listings.component';
import { FoodTypesComponent } from './food-listings/food-types/food-types.component';
import { FoodListingDialogComponent } from './food-listings/food-listing-dialog/food-listing-dialog.component';
import { AppUserInfoComponent } from './authentication/app-user-info/app-user-info.component';
import { DeliverComponent } from './deliver/deliver.component';
import { DeliverDialogComponent } from './deliver/deliver-dialog/deliver-dialog.component';
import { DeliveryFoodListingsFiltersComponent } from './deliver/delivery-food-listings-filters/delivery-food-listings-filters.component';

import { RequestService } from './common-util/services/request.service';
import { RoutePreprocessService } from './common-util/services/route-preprocess.service';
import { SessionDataService } from "./common-util/services/session-data.service";
import { GetDomainValuesService } from './common-util/services/get-domain-values.service';
import { FoodTypesService } from './food-listings/food-types/food-types.service';
import { VehicleTypesService } from './deliver/vehicle-types/vehicle-types.service';
import { DateFormatterPipe } from "./common-util/pipes/date-formatter.pipe";
import { AutoFocusDirective } from './common-util/directives/auto-focus.directive';
import { DefaultImgDirective } from './common-util/directives/default-img.directive';


const appRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/home'
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [RoutePreprocessService],
    },
    {
        path: 'donate',
        component: DonateComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the FoodTypes and VehicleTypes from the back end before routing to the donor interface!
        resolve: {
            foodTypes: FoodTypesService,
            vehicleTypes: VehicleTypesService
        }
    },
    {
        path: 'receive',
        component: ReceiveComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the FoodTypes from the back end before routing to the receiver interface!
        resolve: {
            foodTypes: FoodTypesService
        }
    },
    {
        path: 'deliver',
        component: DeliverComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the VehicleTypes from the back end before routing to the delivery interface!
        resolve: {
            vehicleTypes: VehicleTypesService
        }
    },
    {
        path: 'cart',
        component: CartComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the FoodTypes from the back end before routing to the cart interface!
        resolve: {
            foodTypes: FoodTypesService
        }
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
        AppComponent,
        HomeComponent,
        HeaderComponent,
        FooterComponent,
        LoginComponent,
        DonateComponent,
        ReceiveComponent,
        SignupComponent,
        DateFormatterPipe,
        BannerComponent,
        SlickLeftPanelComponent,
        SlickMapComponent,
        FoodListingsFiltersComponent,
        FoodListingsComponent,
        FoodTypesComponent,
        CartComponent,
        AppUserInfoComponent,
        AutoFocusDirective,
        DefaultImgDirective,
        FoodListingDialogComponent,
        DeliverComponent,
        DeliverDialogComponent,
        DeliveryFoodListingsFiltersComponent
    ],
    imports: [
        NgbModule.forRoot(),
        RouterModule.forRoot(appRoutes),
        AgmCoreModule.forRoot({
            apiKey: 'AIzaSyALtc09EAL5qMDDV5UveWbxhAJqo6WV12g'
        }),
        BrowserModule,
        BrowserAnimationsModule,
        BootstrapModalModule,
        SlickListModule,
        ImageCropperModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        BusyModule,
        AngularMaterialWrapperModule
    ],
    entryComponents: [
        LoginComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        DateFormatterPipe,
        RequestService,
        SessionDataService,
        RoutePreprocessService,
        GetDomainValuesService,
        FoodTypesService,
        VehicleTypesService
    ]
})
export class AppModule { }
