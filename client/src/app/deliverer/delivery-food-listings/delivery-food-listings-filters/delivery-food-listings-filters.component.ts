import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

import { VehicleTypesService } from '../../../domain/vehicle-types/vehicle-types.service';

import { DeliveryFoodListingsFilters } from '../../../../../../shared/deliverer/delivery-food-listings-filters';


@Component({
    selector: 'delivery-food-listings-filters',
    templateUrl: './delivery-food-listings-filters.component.html',
    styleUrls: ['./delivery-food-listings-filters.component.css']
})
export class DeliveryFoodListingsFiltersComponent extends FormGroup implements OnInit {

    @Input() private header: string = 'Filters';
    @Input() private maxWidth: string = null;

    private readonly maxDistances: number[];
    private readonly maxTotalWeights: number[];
    private vehicleTypes: string[];


    public constructor (
        private vehicleTypesService: VehicleTypesService
    ) {
        super({});

        this.maxDistances = [ 5, 10, 15, 20, 25 ];
        this.maxTotalWeights = [ null, 50, 100, 150, 200, 250 ];
        this.vehicleTypes = [];
    }


    public ngOnInit(): void {
        
        // Fetch vehicle types domain values from client cache (should be prerequisite service for this component)
        this.vehicleTypesService.getVehicleTypes()
            .subscribe((vehicleTypes: string[]) => {
                this.vehicleTypes = vehicleTypes;
            });

        const medianDistanceMi: number = this.maxDistances[Math.floor(this.maxDistances.length / 2)];
        this.addControl('maxDistance', new FormControl(medianDistanceMi));
        this.addControl('maxTotalWeight', new FormControl(null));
        this.addControl('vehicleType', new FormControl(null));
    }
}
