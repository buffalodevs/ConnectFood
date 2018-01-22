import { Component, OnChanges, SimpleChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { MatButton } from '@angular/material';
import { SlickScrollableStickyConfig } from '../slick-scrollable-sticky/slick-scrollable-sticky-config';


@Component({
    selector: 'slick-left-panel',
    templateUrl: './slick-left-panel.component.html',
    styleUrls: ['./slick-left-panel.component.css']
})
export class SlickLeftPanelComponent implements OnChanges {

    /**
     * The offset for the button top (Y) position.
     */
    @Input() private buttonTopOffsetPx: number;
    /**
     * The material design icon that will be displayed in the toggle button (given that buttonLabel is not set).
     * The default icon is 'keyboard_arrow_right'.
     */
    @Input() private buttonIcon: string;
    /**
     * Will be displayed as the label for the button.
     * Also, will be placed as the button tooltip if one is not given.
     * If left undefined (null), then the button will not be given text, but rather a 3 (horizontal) line tab icon.
     */
    @Input() private buttonLabel: string;
    /**
     * Set to true if lowercase letters will be allowed to display for the button title/label.
     * Otherwise, will default to false, and all letters will be capitalized.
     */
    @Input() private buttonLabelAllowLowercase: boolean;
    /**
     * The font size of the button title. Ignored if buttonLabel is not provided.
     * Default is 25px;
     */
    @Input() private buttonLabelFontSizePx: number;
    /**
     * The tooltip that will be displayed for the button. If buttonLabel is given and this is null, then defaults to buttonLabel.
     * If neither this or buttonLabel is provided, then defaults to Toggle.
     */
    @Input() private buttonTitle: string;
    /**
     * Determines whether or not a back drop will be used when the panel is toggled to visible in mobile mode. Default is true.
     */
    @Input() private useBackDrop: boolean;
    /**
     * A CSS ID of the container for the slick left panel. This is used to prevent the panel from moving beyond the bottom of a parent contianer
     * when it is in a sticky state.
     */
    @Input() private stickyContainerId: string;
    /**
     * When the screen is below this size, the left panel will collapse.
     * Based off of Bootstrap col- sizes (e.g. xs: 575px, sm: 767px, md: 911px, lg: 1199px).
     * Default is sm (767px).
     */
    @Input() private collapseScreenSize: string;


    @ViewChild('slickLeftPanel') private slickLeftPanel: ElementRef;a
    @ViewChild('slickLeftPanelButton') private slickLeftPanelButton: MatButton;
    @ViewChild('slickLeftPanelBackdrop') private slickLeftPanelBackdrop: ElementRef;


    private readonly ICON_BUTTON_HEIGHT_PX: number;
    private buttonLabelChars: string[];
    private buttonHeightPx: number;
    private slickScrollableStickyConfig: SlickScrollableStickyConfig;


    public constructor() {
        
        this.buttonTopOffsetPx = 62;
        this.buttonIcon = 'keyboard_arrow_right';
        this.buttonLabel = null;
        this.buttonLabelAllowLowercase = false;
        this.buttonLabelFontSizePx = 20;
        this.buttonTitle = 'Open';
        this.useBackDrop = true;
        this.stickyContainerId = null;
        this.collapseScreenSize = 'sm';

        this.ICON_BUTTON_HEIGHT_PX = 65;
        this.updateButtonLabelChars(this.buttonLabel);
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Must split up buttonLabel into an array of char strings to work inside template.
        if (changes.buttonLabel) {
            this.updateButtonLabelChars(changes.buttonLabel.currentValue);
        }

        // If the sticky container is set/changes, then update the slick scrollable sticky config for the panel.
        if (changes.stickyContainerId) {
            this.slickScrollableStickyConfig = new SlickScrollableStickyConfig(true, true, 1.75, null, this.stickyContainerId);
        }
    }


    private updateButtonLabelChars(buttonLabel: string): void {

        this.buttonLabelChars = []; // First refresh.

        // Title is non-empty, so must prepare iterable characters array for template use.
        if (this.buttonLabel != null) {

            //Prepare iterable list of button title characters to display.
            for (let i: number = 0; i < this.buttonLabel.length; i++) {

                const titleChar: string = this.buttonLabelAllowLowercase ? this.buttonLabel.charAt(i)
                                                                         : this.buttonLabel.charAt(i).toUpperCase();
                this.buttonLabelChars.push(titleChar);
            }

            this.buttonHeightPx = ( (this.buttonLabelFontSizePx + 2) * this.buttonLabel.length ) + 15;
        }
        // Title is empty, so leave iterable button title char array empty and use icon button.
        else {
            this.buttonHeightPx = this.ICON_BUTTON_HEIGHT_PX;
        }
    }


    /**
     * Called whenever the slickLeftPanelButton is pressed. Handles the toggling of the slickLeftPanel when in mobile mode.
     */
    public togglePanelVisibility(): void {

        // If our slickLeftPanel div is outside the viewport, and we are translating it into the viewport
        if (!this.isPanelToggledIntoView()) {
            this.toggleIntoView();
        }
        // Else if our slickLeftPanel div is inside the viewport, and we are translating it out of the viewport (getting rid of translation).
        else {
            this.toggleOutOfView();
        }
    }


    /**
     * Determines if the slick left panel is toggled into the viewport.
     */
    public isPanelToggledIntoView(): boolean {
        // If it is in view, then there will be a translation value!
        return this.slickLeftPanel.nativeElement.classList.contains('toggle-into-view');
    }


    /**
     * Toggles the slickLeftPanel into the viewport.
     */
    public toggleIntoView(): void {

        // The toggle-into-view css class contains the translation.
        this.slickLeftPanel.nativeElement.classList.remove('toggle-panel-out-of-view');
        this.slickLeftPanelButton._elementRef.nativeElement.classList.add('hide-button');
        this.slickLeftPanelButton._elementRef.nativeElement.classList.remove('green-glow');
        this.slickLeftPanelButton._elementRef.nativeElement.style.right = '0px';
        if (this.useBackDrop)   this.slickLeftPanelBackdrop.nativeElement.classList.add('show-backdrop');
        this.slickLeftPanelBackdrop.nativeElement.onclick = this.toggleOutOfView.bind(this);
    }


    /**
     * Toggles the slickLeftPanel out of the viewport.
     */
    public toggleOutOfView(): void {

        this.slickLeftPanelBackdrop.nativeElement.onclick = undefined;
        this.slickLeftPanel.nativeElement.classList.add('toggle-panel-out-of-view');
        this.slickLeftPanelButton._elementRef.nativeElement.classList.add('green-glow');
        this.slickLeftPanelButton._elementRef.nativeElement.classList.remove('hide-button');
        this.slickLeftPanelBackdrop.nativeElement.classList.remove('show-backdrop');
        this.slickLeftPanelButton._elementRef.nativeElement.style.right = '-' + this.slickLeftPanelButton._elementRef.nativeElement.offsetWidth + 'px';
    }    
}
