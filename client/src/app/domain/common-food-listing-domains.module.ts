import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material';

import { FoodTypesComponent } from './food-types/food-types.component';
import { FoodTypesService } from './food-types/food-types.service';


@NgModule({
    declarations: [
        FoodTypesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule
    ],
    exports: [
        FoodTypesComponent
    ],
    providers: [
        FoodTypesService
    ]
})
export class CommonFoodListingDomainsModule {}
