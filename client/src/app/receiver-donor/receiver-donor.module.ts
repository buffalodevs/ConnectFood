import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonUtilModule } from '../common-util/common-util.module';
import { AngularMaterialWrapperModule } from '../angular-material-wrapper/angular-material-wrapper.module';
import { SlickFilteredListModule } from '../misc-slick-components/slick-filtered-list/slick-filtered-list.module';
import { CommonFoodListingDomainsModule } from '../domain/common-food-listing-domains.module';
import { ImageCropperModule } from 'ng2-img-cropper';

import { FoodListingsFiltersComponent } from './food-listings/food-listings-filters/food-listings-filters.component';
import { FoodListingDialogComponent } from './food-listings/food-listing-dialog/food-listing-dialog.component';
import { FoodListingInfoComponent } from './food-listings/food-listing-dialog/food-listing-info/food-listing-info.component';
import { FoodListingClaimComponent } from './food-listings/food-listing-dialog/food-listing-claim/food-listing-claim.component';
import { FoodListingsComponent } from './food-listings/food-listings.component';
import { DonateComponent } from './donate/donate.component';
import { ReceiveComponent } from './receive/receive.component';
import { FoodListingCartComponent } from './food-listing-cart/food-listing-cart.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { FoodTypesService } from '../domain/food-types/food-types.service';
import { VehicleTypesService } from '../domain/vehicle-types/vehicle-types.service';
import { ManageFoodListingService } from './food-listings/food-listing-services/manage-food-listing.service';


const receiverDonorRoutes: Routes = [
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
        path: 'foodListingCart',
        component: FoodListingCartComponent,
        canActivate: [RoutePreprocessService],
        // Make sure that we get the FoodTypes from the back end before routing to the cart interface!
        resolve: {
            foodTypes: FoodTypesService
        }
    }
];


@NgModule({
    declarations: [
        FoodListingsFiltersComponent,
        FoodListingDialogComponent,
        FoodListingInfoComponent,
        FoodListingClaimComponent,
        FoodListingsComponent,
        DonateComponent,
        ReceiveComponent,
        FoodListingCartComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(receiverDonorRoutes),
        FormsModule,
        ReactiveFormsModule,
        CommonUtilModule,
        AngularMaterialWrapperModule,
        SlickFilteredListModule,
        CommonFoodListingDomainsModule,
        ImageCropperModule
    ],
    providers: [
        ManageFoodListingService
    ]
})
export class ReceiverDonorModule {}
