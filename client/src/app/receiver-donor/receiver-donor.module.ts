import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatInputModule, MatButtonModule, MatStepperModule, MatRadioModule, MatCheckboxModule, MatExpansionModule, MatSelectModule } from '@angular/material';

import { CommonUtilModule } from '../common-util/common-util.module';
import { SlickDatePickerModule } from '../slick/slick-date-time/slick-date-picker/slick-date-picker.module';
import { SlickExpansionPanelModule } from '../slick/slick-expansion-panel/slick-expansion-panel.module';
import { SlickFilteredListModule } from '../slick/slick-filtered-list/slick-filtered-list.module';
import { SlickImgManagerModule } from '../slick/slick-img-manager/slick-img-manager.module';
import { CommonFoodListingDomainsModule } from '../domain/common-food-listing-domains.module';
import { DonateModule } from './donate/donate.module';

import { FoodListingFiltersComponent } from './food-listings-filters/food-listing-filters.component';
import { FoodListingDialogComponent } from './food-listings/food-listing-dialog/food-listing-dialog.component';
import { FoodListingInfoComponent } from './food-listings/food-listing-dialog/food-listing-info/food-listing-info.component';
import { FoodListingClaimComponent } from './food-listings/food-listing-dialog/food-listing-claim/food-listing-claim.component';
import { FoodListingUnclaimComponent } from './food-listings/food-listing-dialog/food-listing-unclaim/food-listing-unclaim.component';
import { FoodListingRemoveComponent } from './food-listings/food-listing-dialog/food-listing-remove/food-listing-remove.component';
import { FoodListingsComponent } from './food-listings/food-listings.component';
import { ReceiveComponent } from './receive/receive.component';
import { FoodListingCartComponent } from './food-listing-cart/food-listing-cart.component';

import { RoutePreprocessService } from '../common-util/services/route-preprocess.service';
import { FoodTypesService } from '../domain/food-types/food-types.service';
import { ManageFoodListingService } from './food-listings/food-listing-services/manage-food-listing.service';


const receiverDonorRoutes: Routes = [
    {
        path: 'receive',
        component: ReceiveComponent,
        canActivate: [RoutePreprocessService]
    },
    {
        path: 'foodListingCart',
        component: FoodListingCartComponent,
        canActivate: [RoutePreprocessService]
    }
];


@NgModule({
    declarations: [
        FoodListingFiltersComponent,
        FoodListingDialogComponent,
        FoodListingInfoComponent,
        FoodListingClaimComponent,
        FoodListingUnclaimComponent,
        FoodListingRemoveComponent,
        FoodListingsComponent,
        ReceiveComponent,
        FoodListingCartComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(receiverDonorRoutes),
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
        DonateModule,
        SlickDatePickerModule,
        SlickExpansionPanelModule,
        SlickFilteredListModule,
        SlickImgManagerModule,
        CommonFoodListingDomainsModule
    ],
    providers: [
        ManageFoodListingService
    ],
    entryComponents: [
        FoodListingDialogComponent
    ]
})
export class ReceiverDonorModule {}
