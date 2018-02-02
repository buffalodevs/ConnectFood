import { Directive, OnInit, ElementRef, Input } from '@angular/core';
import { MatExpansionPanel } from '@angular/material';
import { ResponsiveService } from '../../common-util/services/responsive.service';


@Directive({
    selector: '[SlickExpansionPanel]'
})
export class SlickExpansionPanelDirective implements OnInit {

    /**
     * The max-width (px) of the viewport where the panel will be initialized as collapsed.
     * Default is 767 (px).
     */
    @Input() public collapseWidth: number;
    /**
     * Set to true if the panel should always glow when collapsed (Even if it has been previously opened).
     * Default is false.
     */
    @Input() public alwaysGlowWhenClosed: boolean;
    /**
     * Set to true if the panel should glow when it is initialized as collapsed.
     * Default is true.
     */
    @Input() public glowOnInitializedClosed: boolean;
    /**
     * The css class to apply for the glow effect.
     * Default is 'green-glow'.
     */
    @Input() public glowClass: string;


    public constructor (
        private _elementRef: ElementRef,
        private _hostExpansionPanel: MatExpansionPanel,
        private _responsiveService: ResponsiveService
    ) {
        this.collapseWidth = 767;
        this.alwaysGlowWhenClosed = false;
        this.glowOnInitializedClosed = true;
        this.glowClass = 'green-glow';

        this._hostExpansionPanel.opened.subscribe(this.handlePanelOpen.bind(this));
        this._hostExpansionPanel.closed.subscribe(this.handlePanelClose.bind(this));
    }


    public ngOnInit(): void {

        // If the panel be initialized as collapsed due to small viewport width.
        if (!this._responsiveService.widthGreaterThan(this.collapseWidth)) {
            this._hostExpansionPanel.expanded = false;
        }

        // If the panel has been initialized as collapsed.
        if (this.glowOnInitializedClosed && this._hostExpansionPanel.expanded === false) {
            (<HTMLElement>this._elementRef.nativeElement).classList.add(this.glowClass);
        }
    }


    private handlePanelOpen(): void {

        let elemClassList: DOMTokenList = (<HTMLElement>this._elementRef.nativeElement).classList;

        if (elemClassList.contains(this.glowClass)) {
            elemClassList.remove(this.glowClass);
        }
    }


    private handlePanelClose(): void {

        if (this.alwaysGlowWhenClosed) {
            (<HTMLElement>this._elementRef.nativeElement).classList.add(this.glowClass);            
        }
    }
}
