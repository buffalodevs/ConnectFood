import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable } from "rxjs/Observable";

import { AbstractSlickList } from './../../misc-slick-components/slick-filtered-list/slick-list/abstract-slick-list';
import { AbstractSlickListDialog } from '../../misc-slick-components/slick-filtered-list/slick-list/slick-list-dialog/abstract-slick-list-dialog';
import { GetListingsService } from '../../misc-slick-components/slick-filtered-list/slick-list/get-listings.service';

import { FoodListing } from '../../../../../shared/receiver-donor/food-listing';
import { FoodListingsFilters } from "../../../../../shared/receiver-donor/food-listings-filters";


@Component({
    selector: 'food-listings',
    templateUrl: './food-listings.component.html',
    styleUrls: ['./food-listings.component.css']
})
export class FoodListingsComponent {

    /**
     * The food listings that shall be displayed.
     */
    @Input() private foodListings: FoodListing[];

    /**
     * Emitted whenever a listing (given by an index) is to be selected.
     */
    @Output() private selectListing: EventEmitter<number>;


    public constructor () {
        this.foodListings = [];
        this.selectListing = new EventEmitter<number>();
    }
}
