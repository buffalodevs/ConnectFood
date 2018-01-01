import { Component, OnInit, ViewChild, Input } from '@angular/core';

import { AbstractSlickList } from '../../misc-slick-components/slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetListingsService } from '../../misc-slick-components/slick-filtered-list/slick-list/get-listings.service';
import { DeliveryUtilService } from './delivery-services/delivery-util.service';

import { Delivery } from '../../../../../shared/deliverer/delivery';
import { DeliveryFilters } from '../../../../../shared/deliverer/delivery-filters';
import { GPSCoordinate } from '../../../../../shared/common-util/geocode';
import { Address } from '../../../../../shared/app-user/app-user-info';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { TimeRange } from '../../../../../shared/app-user/time-range';


@Component({
    selector: 'delivery-listings',
    templateUrl: './delivery-listings.component.html',
    styleUrls: ['./delivery-listings.component.css']
})
export class DeliveryListingsComponent extends AbstractSlickList <Delivery, DeliveryFilters> {

    /**
     * Set to true if the Delivery Listings are for a Delivery Cart. Default is false.
     */
    @Input() private isCart: boolean;

    @ViewChild('DeliveryListingDialogComponent') protected slickListDialog: AbstractSlickListDialog <Delivery>;


    public constructor (
        private sessionDataService: SessionDataService,
        private getDeliveriesService: GetListingsService <Delivery, DeliveryFilters>,
        private deliveryUtilService: DeliveryUtilService // Referenced in HTML template
    ) {
        super(getDeliveriesService, '/deliverer/getDeliveries');
        this.isCart = false;
    }


    /**
     * Pre-processes any received list data before it is displayed/used.
     * Here, we ensure that all JSON ISO string format dates are converted to Date objects.
     * @param listData The received list data.
     */
    protected onReceivedListData(listData: Array<Delivery>): void {
        
        for (let i: number = 0; i < listData.length; i++) {

            if (listData[i].possibleDeliveryTimes != null) {
                this.convertJSONStringsToDates(listData[i].possibleDeliveryTimes);
            }
        }
    }


    /**
     * Converts JSON ISO date strings to Date objects.
     * @param possibleDeliveryTimes The possible delivery times containing JSON ISO date strings
     *                              NOTE: This will be internally modified!
     */
    private convertJSONStringsToDates(possibleDeliveryTimes: TimeRange[]): void {

        for (let i: number = 0; i < possibleDeliveryTimes.length; i++) {
            // Constructing new Time Range will convert any input ISO strings to dates automatically!
            possibleDeliveryTimes[i] = new TimeRange(possibleDeliveryTimes[i].startTime, possibleDeliveryTimes[i].endTime);
        }
    }
}
