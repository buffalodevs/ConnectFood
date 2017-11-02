import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-delivery-food-listings-filters',
    templateUrl: './delivery-food-listings-filters.component.html',
    styleUrls: ['./delivery-food-listings-filters.component.css']
})
export class DeliveryFoodListingsFiltersComponent implements OnInit {

    private distancesMi: number[];
    private totalWeightsLbs: number[];
    private vehicleTypes


    public constructor() {
        this.distancesMi = [ 5, 10, 15, 20, 25 ];
        this.totalWeightsLbs = [ 50, 100, 150, 200 ];
        this.vehicleTypes = [ 'Sedan', 'Van', 'Pickup Truck', 'Commercial Truck' ];
    }

    public ngOnInit() {

    }

}
