import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

import { VehicleTypesService } from '../../domain/vehicle-types/vehicle-types.service';

import { DeliveryFoodListingsFilters } from '../../../../../shared/food-listings/delivery-food-listings-filters';


@Component({
    selector: 'app-delivery-food-listings-filters',
    templateUrl: './delivery-food-listings-filters.component.html',
    styleUrls: ['./delivery-food-listings-filters.component.css']
})
export class DeliveryFoodListingsFiltersComponent extends FormGroup implements OnInit {

    private readonly maxDistances: number[];
    private readonly maxTotalWeights: number[];
    private vehicleTypes: string[];


    public constructor (
        private vehicleTypesService: VehicleTypesService
    ) {
        super({});

        this.maxDistances = [ 5, 10, 15, 20, 25 ];
        this.maxTotalWeights = [ 50, 100, 150, 200, 250 ];
        this.vehicleTypes = [];
    }


    public ngOnInit(): void {
        
        // Fetch vehicle types domain values from client cache (should be prerequisite service for this component)
        this.vehicleTypesService.getVehicleTypes()
            .subscribe((vehicleTypes: string[]) => {
                this.vehicleTypes = vehicleTypes;
            });

        const medianDistanceMi: number = this.maxDistances[this.maxDistances.length / 2];
        this.addControl('maxDistance', new FormControl(medianDistanceMi));
        this.addControl('maxTotalWeight', new FormControl(null));
        this.addControl('vehicleType', new FormControl(null));
    }
}
