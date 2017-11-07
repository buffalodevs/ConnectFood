import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdCheckboxModule } from '@angular/material';

import { FoodTypesComponent } from './food-types/food-types.component';
import { FoodTypesService } from './food-types/food-types.service';
import { VehicleTypesService } from './vehicle-types/vehicle-types.service';
import { GetDomainValuesService } from './get-domain-values.service';


@NgModule({
    declarations: [
        FoodTypesComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MdCheckboxModule
    ],
    exports: [
        FoodTypesComponent
    ],
    providers: [
        FoodTypesService,
        VehicleTypesService
    ]
})
export class CommonFoodListingDomainsModule { }
