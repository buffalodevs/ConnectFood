import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from "rxjs/Observable";

import { AbstractSlickList } from './slick-list/abstract-slick-list';
import { SlickListFilters } from './slick-list/slick-list-message/slick-list-request';

import { FoodListing } from "../../../../../shared/receiver-donor/food-listing";
import { FoodListingsFilters, LISTINGS_STATUS } from "../../../../../shared/receiver-donor/food-listings-filters";


export abstract class AbstractSlickFilteredList<LIST_T, FILT_T extends SlickListFilters> implements AfterViewInit {

    @ViewChild('filters') protected filters: FormGroup;
    @ViewChild('listings') protected listings: AbstractSlickList<LIST_T, FILT_T>;
        

    protected constructor() {}


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {

        // First, trigger a refresh by manually invoking update function.
        setTimeout(() => { this.onFiltersUpdate(this.filters.value); }, 0); // Wait for component initialization to finish!
        this.filters.valueChanges.subscribe(this.onFiltersUpdate.bind(this));
    }


    /**
     * Handles filters updates by refreshing listings.
     * @param filters The filters that will be used to fetch listings.
     */
    protected onFiltersUpdate(filters: FILT_T): void {
        this.listings.refreshList(filters);
    }
}
