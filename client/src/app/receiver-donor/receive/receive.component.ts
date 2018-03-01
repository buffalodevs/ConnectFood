import { Component } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { DateFormatterService } from '../../common-util/services/date-formatter.service';
import { SpecificAvailabilityDialogComponent } from '../food-listings-filters/specifc-availability-dialog/specific-availability-dialog.component';
import { FoodListingsStatus } from "../../../../../shared/src/common-receiver-donor-deliverer/food-listing";
import { FoodListingFilters } from '../../../../../shared/src/common-receiver-donor-deliverer/food-listing-filters';


@Component({
    selector: 'app-receive',
    templateUrl: './receive.component.html',
    styleUrls: ['./receive.component.css']
})
export class ReceiveComponent {

    public additionalFilters: Map <string, AbstractControl>;

    
    public constructor (
        public dateFormatter: DateFormatterService,
        private _dialog: MatDialog
    ) {

        // Get default filters values by default constructing a new filters object.
        const filters: FoodListingFilters = new FoodListingFilters();

        this.additionalFilters = new Map <string, AbstractControl>([
            [ 'foodListingsStatus', new FormControl(FoodListingsStatus.unclaimedListings) ],
            [ 'specificAvailabilityTimes', new FormControl(filters.specificAvailabilityTimes) ],
            [ 'matchRegularAvailability', new FormControl(filters.matchRegularAvailability) ]
        ]);
    }


    /**
     * Opens up a modal dialog that allows the user to sepcify availability times.
     * Listens for the dialog to close and assigns the result (if there is any).
     */
    public specifyAvailability(): void {

        const dialogConfig: MatDialogConfig = new MatDialogConfig();
        dialogConfig.panelClass = 'slick-list-dialog';
        dialogConfig.data = this.additionalFilters.get('specificAvailabilityTimes').value;

        const dialogRef = this._dialog.open(SpecificAvailabilityDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((specificAvailabilityTimes: Date[]) => {

            // Make sure result is not null (for cancel).
            if (specificAvailabilityTimes != null) {
                this.additionalFilters.get('specificAvailabilityTimes').setValue(specificAvailabilityTimes);
            }
        });
    }
}
