import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';
import { SlickFilteredListModule } from '../misc-slick-components/slick-filtered-list/slick-filtered-list.module';
import { SlickMapModule } from '../misc-slick-components/slick-map/slick-map.module';
import { SlickWeekdaySchedulerModule } from '../misc-slick-components/slick-weekday-scheduler/slick-weekday-scheduler.module';

import { DeliveryListingsComponent } from './delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from './delivery-listings/delivery-listings-filters/delivery-listings-filters.component';
import { DeliveryListingInfoComponent } from './delivery-listings/delivery-listing-dialog/delivery-listing-info/delivery-listing-info.component';
import { DeliveryListingScheduleComponent } from './delivery-listings/delivery-listing-dialog/delivery-listing-schedule/delivery-listing-schedule.component';
import { DeliveryListingCancelComponent } from './delivery-listings/delivery-listing-dialog/delivery-listing-cancel/delivery-listing-cancel.component';
import { DeliveryListingDialogComponent } from './delivery-listings/delivery-listing-dialog/delivery-listing-dialog.component';
import { DeliverComponent } from './deliver/deliver.component';
import { DeliveryCartComponent } from './delivery-cart/delivery-cart.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { VehicleTypesService } from '../domain/vehicle-types/vehicle-types.service';
import { DeliveryUtilService } from './delivery-listings/delivery-services/delivery-util.service';
import { ManageDeliveryService } from './delivery-listings/delivery-services/manage-deliveries.service';
import { ScheduleDeliveryService } from './delivery-listings/delivery-services/schedule-delivery.service';


const delivererRoutes: Routes = [
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
        path: 'deliveryCart',
        component: DeliveryCartComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the VehicleTypes from the back end before routing to the delivery cart interface!
        resolve: {
            VehicleTypes: VehicleTypesService
        }
    }
];


@NgModule({
    declarations: [
        DeliveryListingsComponent,
        DeliveryListingsFiltersComponent,
        DeliveryListingInfoComponent,
        DeliveryListingScheduleComponent,
        DeliveryListingCancelComponent,
        DeliveryListingDialogComponent,
        DeliverComponent,
        DeliveryCartComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(delivererRoutes),
        FormsModule,
        ReactiveFormsModule,
        AgmCoreModule,
        AngularMaterialWrapperModule,
        CommonUtilModule,
        SlickFilteredListModule,
        SlickMapModule,
        SlickWeekdaySchedulerModule
    ],
    providers: [
        DeliveryUtilService,
        ScheduleDeliveryService,
        ManageDeliveryService
    ]
})
export class DelivererModule {}
