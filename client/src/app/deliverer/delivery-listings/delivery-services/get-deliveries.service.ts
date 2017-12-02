"use strict";
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { GetListingsService } from '../../../slick-filtered-list/slick-list/get-listings.service';
import { RequestService } from '../../../common-util/services/request.service';

import { DeliveryFilters, GetDeliveriesRequest } from '../../../../../../shared/deliverer/message/get-deliveries-message';
import { Delivery } from '../../../../../../shared/deliverer/delivery';


@Injectable()
export class GetDeliveriesService extends GetListingsService <Delivery, DeliveryFilters> {
    
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
    protected generateListingsRequest(filters: DeliveryFilters): GetDeliveriesRequest {
        return new GetDeliveriesRequest(filters);
    }
}
