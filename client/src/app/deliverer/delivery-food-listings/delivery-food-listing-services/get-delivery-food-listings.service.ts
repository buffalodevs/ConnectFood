"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GetListingsService } from '../../../slick-filtered-list/slick-list/get-listings.service';
import { RequestService } from '../../../common-util/services/request.service';

import { DeliveryFoodListingsFilters, GetDeliveryFoodListingsRequest } from '../../../../../../shared/deliverer/message/get-delivery-food-listings-message';
import { DeliveryFoodListing } from '../../../../../../shared/deliverer/delivery-food-listing';


@Injectable()
export class GetDeliveryFoodListingsService extends GetListingsService <DeliveryFoodListing, DeliveryFoodListingsFilters> {
    
    public constructor (
        requestService: RequestService
    ) {
        super(requestService);
    }


    /**
     * Abstract method that should be overriden by child class. Generates the final request object that will be JSON-ified and sent to the server.
     * The request object must either e SlickListRequest or by a subclass of it.
     * @param filters The filter criteria used when retrieving listings.
     * @return The final request that will be sent to the server.
     */
    protected generateListingsRequest(filters: DeliveryFoodListingsFilters): GetDeliveryFoodListingsRequest {
        return new GetDeliveryFoodListingsRequest(filters);
    }
}
