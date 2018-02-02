import { Component, OnInit, Input } from '@angular/core';

import { ResponsiveService } from '../../../../common-util/services/responsive.service';


@Component({
    selector: 'slick-list-item',
    templateUrl: './slick-list-item.component.html',
    styleUrls: ['./slick-list-item.component.css']
})
export class SlickListItemComponent implements OnInit {

    /**
     * Flag signifying whether or not to include divider (hr) elements in list.
     */
    @Input() public includeBorder;
    /**
     * Determines if the header should be placed on the top (above left and right panels) or right.
     * Default placement is right.
     */
    @Input() public headerPlacement; // 'body' or 'top'
    /**
     * Determines if the header placement should be fixed regardless of screen size.
     * Default is not fixed (it will adjust based on screen size).
     */
    @Input() public fixHeaderPlacement;

    
    public constructor (
        private _responsiveService: ResponsiveService
    ) {
        this.includeBorder = true;
        this.headerPlacement = 'top'
        this.fixHeaderPlacement = false;

        this.updateHeaderPosition();
    }


    public ngOnInit(): void {
        
        if (!this.fixHeaderPlacement) {
            window.addEventListener('resize', this.updateHeaderPosition.bind(this), true);
        }
    }


    /**
     * Determines if we should show the header on the very top above left and right panel contents, or in right panel.
     */
    private updateHeaderPosition(): void {

        // If our header placement is fixed, then we will not update its position!
        if (this.fixHeaderPlacement)    return;

        this.headerPlacement = this._responsiveService.widthGreaterThan(1199) ? 'body'
                                                                              : 'top';
    }
}
