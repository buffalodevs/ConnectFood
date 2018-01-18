import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SlickListComponent } from './slick-list/slick-list.component';
import { SlickListFilters } from './slick-list-filters/slick-list-filters';


@Component({
    selector: 'slick-filtered-list',
    templateUrl: './slick-filtered-list.component.html',
    styleUrls: ['./slick-filtered-list.component.css']
})
export class SlickFilteredListComponent {

    @Input() private filters: FormGroup;
    @Input() private listings: SlickListComponent<any>;
    @Input() private slickLeftPanelButtonTitle: string;


    public constructor() {
        this.slickLeftPanelButtonTitle = 'Open';
    }


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        
        // Listen for fitler changes and send them to slick list.
        this.listings.refreshListOn(this.filters.valueChanges);

        // First, trigger a refresh by manually invoking update function.
        setTimeout(() => this.filters.updateValueAndValidity(), 0); // Wait for component initialization to finish!
    }
}
