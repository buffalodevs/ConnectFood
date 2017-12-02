import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';
import { SlickFilteredListModule } from '../slick-filtered-list/slick-filtered-list.module';
import { SlickMapModule } from '../slick-map/slick-map.module';

import { DeliveryListingsComponent } from './delivery-listings/delivery-listings.component';
import { DeliveryListingsFiltersComponent } from './delivery-listings/delivery-listings-filters/delivery-listings-filters.component';
import { DeliveryListingDialogComponent } from './delivery-listings/delivery-listing-dialog/delivery-listing-dialog.component';
import { DeliverComponent } from './deliver/deliver.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { VehicleTypesService } from '../domain/vehicle-types/vehicle-types.service';
import { GetDeliveriesService } from './delivery-listings/delivery-services/get-deliveries.service';
import { DeliveryUtilService } from './delivery-listings/delivery-services/delivery-util.service';


const delivererRoutes: Routes = [
    {
        path: 'deliver',
        component: DeliverComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the VehicleTypes from the back end before routing to the delivery interface!
        resolve: {
            vehicleTypes: VehicleTypesService
        }
    }
];


@NgModule({
    declarations: [
        DeliveryListingsComponent,
        DeliveryListingsFiltersComponent,
        DeliveryListingDialogComponent,
        DeliverComponent
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
        SlickMapModule
    ],
    providers: [
        GetDeliveriesService,
        DeliveryUtilService
    ]
})
export class DelivererModule {}
