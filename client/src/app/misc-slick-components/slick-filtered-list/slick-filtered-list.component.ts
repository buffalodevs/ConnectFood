import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { SlickListComponent } from './slick-list/slick-list.component';


@Component({
    selector: 'slick-filtered-list',
    templateUrl: './slick-filtered-list.component.html',
    styleUrls: ['./slick-filtered-list.component.css']
})
export class SlickFilteredListComponent {

    @Input() private filters: FormGroup;
    @Input() private listings: SlickListComponent;

    public constructor() {}


    /**
     * Executed after all of the view children have been initialized (so safest to interact with them now).
     */
    public ngAfterViewInit(): void {
        
        // First, trigger a refresh by manually invoking update function.
        setTimeout(() => { this.listings.refreshList(this.filters.value); }, 0); // Wait for component initialization to finish!
        this.filters.valueChanges.subscribe(this.listings.refreshList.bind(this.listings));
    }
}
