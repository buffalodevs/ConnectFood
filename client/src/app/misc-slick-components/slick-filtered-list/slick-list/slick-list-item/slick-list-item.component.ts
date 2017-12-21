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
    @Input() private includeDivider = true;
    /**
     * Determines if the header should be placed on the top (above left and right panels) or right.
     * Default placement is right.
     */
    @Input() private headerPlacement; // 'right' or 'top'
    /**
     * Determines if the header placement should be fixed regardless of screen size.
     * Default is not fixed (it will adjust based on screen size).
     */
    @Input() private fixHeaderPlacement = false;

    public constructor (
        private responsiveService: ResponsiveService
    ) {
        this.updateHeaderPosition();
    }


    public ngOnInit(): void {
        
        if (!this.fixHeaderPlacement) {
            window.addEventListener('resize', this.updateHeaderPosition.bind(this), true);
        }
    }


    /**
     * Determines whether or not the header should be hidden.
     * @param header The header HTML Element.
     * @param placement The placement of the header ('right' or 'top').
     * @return true if it should be hidden, false if it should be displayed.
     */
    private hideHeader(header: HTMLElement, placement: string): boolean {
        return (header.children.length === 0 || this.headerPlacement !== placement);
    }


    /**
     * Determines if we should show the header on the very top above left and right panel contents, or in right panel.
     */
    private updateHeaderPosition(): void {
        this.headerPlacement = this.responsiveService.widthGreaterThan(767) ? 'right'
                                                                            : 'top';
    }
}
