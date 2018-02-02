import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

import { VehicleTypesService } from '../../domain/vehicle-types/vehicle-types.service';


@Component({
    selector: 'delivery-listings-filters',
    templateUrl: './delivery-listings-filters.component.html',
    styleUrls: ['./delivery-listings-filters.component.css']
})
export class DeliveryListingsFiltersComponent extends FormGroup implements OnInit {

    @Input() public header: string;
    /**
     * Additional filter controls and associated names.
     */
    @Input() public additionalFilters: Map <string, AbstractControl>;

    public readonly maxDistances: number[];
    public readonly maxTotalWeights: number[];
    public vehicleTypes: string[];


    public constructor (
        private vehicleTypesService: VehicleTypesService
    ) {
        super({});

        this.header = 'Filters';
        this.maxDistances = [ 5, 10, 15, 20, 25 ];
        this.maxTotalWeights = [ null, 50, 100, 150, 200, 250 ];
        this.vehicleTypes = [];
    }


    public ngOnInit(): void {
        
        // Fetch vehicle types domain values from client cache (should be prerequisite service for this component)
        this.vehicleTypesService.getVehicleTypes().subscribe((vehicleTypes: string[]) => {
            this.vehicleTypes = vehicleTypes;
        });

        const medianDistanceMi: number = this.maxDistances[Math.floor(this.maxDistances.length / 2)];
        this.addControl('maxDistance', new FormControl(medianDistanceMi));
        this.addControl('maxTotalWeight', new FormControl(null));
        this.addControl('vehicleType', new FormControl(null));

        // Add any parent specified additional filter controls.
        if (this.additionalFilters != null) {
            
            let additionalFiltersKeys: string[] = Array.from(this.additionalFilters.keys());
            for(let additionalFilterControlName of additionalFiltersKeys) {
                
                this.addControl(additionalFilterControlName, this.additionalFilters.get(additionalFilterControlName));
            }
        }
    }
}
