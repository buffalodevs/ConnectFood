import { Component, Input } from '@angular/core';
import { MdExpansionPanel } from '@angular/material';

import { ResponsiveService } from '../../common-util/services/responsive.service';


@Component({
    selector: 'slick-expansion-panel',
    templateUrl: './slick-expansion-panel.component.html',
    styleUrls: ['./slick-expansion-panel.component.css']
})
export class SlickExpansionPanelComponent {

    @Input() private expanded: boolean = true;
    @Input() private collapseWidth: number = 767;
    @Input() private minHeightStyle: string = '100%';


    public constructor (
        private responsiveService: ResponsiveService
    ) { }


    /**
     * Determines whether or not the expansion panel should be initially expanded.
     * @return true if it should be initially expanded, false if it should be collapsed.
     */
    private initExpanded(): boolean {
        return (this.collapseWidth != null) ? this.responsiveService.widthGreaterThan(this.collapseWidth)
                                            : this.expanded;
    }


    /**
     * Removes a green glow effect from the given panel header.
     * @param panelHeader The panel header from which to remove the green glow effect from.
     */
    private removeGreenGlow(panelHeader: HTMLElement): void {

        if (panelHeader != null && panelHeader.classList.contains('green-glow')) {
            panelHeader.classList.remove('green-glow');
        }
    }


    /**
     * Gets the minimum height for the expansion panel.
     * @param panel The expansion panel component.
     * @return The minimum height (style) for the expansion panel.
     */
    private getMinHeight(panel: MdExpansionPanel): string {
        return (panel.expanded) ? this.minHeightStyle
                                : null;
    }
}
