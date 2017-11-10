import { Component, Input, ViewChild } from '@angular/core';

import { AbstractSlickListDialog } from '../../../slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { SlickListDialogComponent } from '../../../slick-filtered-list/slick-list/slick-list-dialog/slick-list-dialog.component';
import { ResponsiveService } from '../../../common-util/services/responsive.service';

import { FoodListing } from './../../../../../../shared/food-listings/food-listing';


@Component({
  selector: 'food-listing-dialog',
  templateUrl: './food-listing-dialog.component.html',
  styleUrls: ['./food-listing-dialog.component.css', '../food-listings.component.css']
})
export class FoodListingDialogComponent extends AbstractSlickListDialog <FoodListing> {
    
    /**
     * Determines if this dialog is displaying Food Listing info for a Receiver's Cart. Default is false.
     */
    @Input() private isClaimedCart: boolean = false;
    /**
     * Determines if this dialog is displaying Food Listing info for a Donor's Cart. Default is false.
     */
    @Input() private isDonatedCart: boolean = false;
    /**
     * Default replacement image URL if one is not provided or if the provided one does not exist.
     */
    @Input() private defaultImgUrl: string = null;

    /**
     * This is a shadow of the slickListDialog member in AbstractSlickListDialog.
     * It is all that is needed to make basic dialog functions work (open, close, etc).
     */
    @ViewChild('SlickListDialogComponent') protected slickListDialog: SlickListDialogComponent; 


    public constructor (
        private responsiveService: ResponsiveService
    ) {
        super();
    }
}
