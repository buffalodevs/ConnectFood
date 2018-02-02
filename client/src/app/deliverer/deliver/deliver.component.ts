import { Component } from '@angular/core';
import { FormControl, AbstractControl } from '@angular/forms';
import { DeliveryUtilService } from '../delivery-listings/delivery-services/delivery-util.service';


@Component({
    selector: 'deliver',
    templateUrl: './deliver.component.html',
    styleUrls: ['./deliver.component.css']
})
export class DeliverComponent {
    
    public additionalFilters: Map<string, AbstractControl>


    public constructor (
        private deliveryUtilService: DeliveryUtilService
    ) {
        this.additionalFilters = new Map<string, AbstractControl>([
            [ 'matchRegularAvailability', new FormControl(true) ],
            [ 'unscheduledDeliveries', new FormControl(true) ]
        ]);
    }
}
