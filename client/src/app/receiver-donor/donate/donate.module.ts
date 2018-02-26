import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule, MatButtonModule, MatStepperModule, MatRadioModule, MatCheckboxModule, MatExpansionModule, MatSelectModule } from '@angular/material';

import { CommonUtilModule } from '../../common-util/common-util.module';
import { SlickDatePickerModule } from '../../slick/slick-date-time/slick-date-picker/slick-date-picker.module';
import { SlickTimeModule } from '../../slick/slick-date-time/slick-time/slick-time.module';
import { CommonFoodListingDomainsModule } from '../../domain/common-food-listing-domains.module';
import { SlickDateTimeScheduleBuilderModule } from '../../slick/slick-scheduler/slick-date-time-schedule-builder/slick-date-time-schedule-builder.module';
import { SlickWeekdayScheduleBuilderModule } from '../../slick/slick-scheduler/slick-weekday-schedule-builder/slick-weekday-schedule-builder.module';
import { SlickImgManagerModule } from '../../slick/slick-img-manager/slick-img-manager.module';

import { PrimaryDonateComponent } from './primary-donate/primary-donate.component';
import { AvailabilityDonateComponent } from './availability-donate/availability-donate.component'
import { DonateComponent } from './donate.component';

import { RoutePreprocessService } from '../../common-util/services/route-preprocess.service';
import { AddFoodListingService } from './donate-services/add-food-listing.service';


const donateRoute: Routes = [
    {
        path: 'donate',
        component: DonateComponent,
        canActivate: [RoutePreprocessService]
    }
];


@NgModule({
    declarations: [
        PrimaryDonateComponent,
        AvailabilityDonateComponent,
        DonateComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(donateRoute),
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        MatStepperModule,
        MatRadioModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSelectModule,
        CommonUtilModule,
        SlickImgManagerModule,
        SlickDatePickerModule,
        SlickTimeModule,
        SlickWeekdayScheduleBuilderModule,
        SlickDateTimeScheduleBuilderModule,
        CommonFoodListingDomainsModule
    ],
    providers: [
        AddFoodListingService
    ]
})
export class DonateModule {}
