import { Component, OnChanges, SimpleChanges, Input } from '@angular/core';


@Component({
    selector: 'app-slick-left-panel',
    templateUrl: './slick-left-panel.component.html',
    styleUrls: ['./slick-left-panel.component.css']
})
export class SlickLeftPanelComponent implements OnChanges {

    /**
     * The title of the toggle button. Will be displayed as the label for the button.
     * Also, will be placed as the button tooltip if one is not given.
     * If left undefined (null), then the button will not be given text, but rather a 3 (horizontal) line tab icon.
     */
    @Input() private buttonTitle: string;
    /**
     * Set to true if lowercase letters will be allowed to display for the button title/label.
     * Otherwise, will default to false, and all letters will be capitalized.
     */
    @Input() private buttonTitleAllowLowercase: boolean;
    /**
     * The font size of the button title. Ignored if buttonTitle is not provided.
     * Default is 25px;
     */
    @Input() private buttonTitleFontSizePx: number;
    /**
     * The tooltip that will be displayed for the button. If buttonTitle is given and this is null, then defaults to buttonTitle.
     * If neither this or buttonTitle is provided, then defaults to Toggle.
     */
    @Input() private buttonTooltip: string;
    /**
     * Determines whether or not a back drop will be used when the panel is toggled to visible in mobile mode. Default is true.
     */
    @Input() private useBackDrop: boolean;


    private readonly BASE_BUTTON_HEIGHT_PX: number;
    private buttonTitleChars: string[];
    private buttonHeightPx: number;


    public constructor() {
        this.buttonTitle = null;
        this.buttonTitleAllowLowercase = false;
        this.buttonTitleFontSizePx = 20;
        this.buttonTooltip = 'Toggle';
        this.useBackDrop = true;

        this.BASE_BUTTON_HEIGHT_PX = 65;
        this.updateButtonTitleChars(this.buttonTitle);
    }


    public ngOnChanges(changes: SimpleChanges): void {

        if (changes.buttonTitle) {
            this.updateButtonTitleChars(changes.buttonTitle.currentValue);
        }
    }


    private updateButtonTitleChars(buttonTitle: string): void {

        this.buttonTitleChars = []; // First refresh.

        // Title is non-empty, so must prepare iterable characters array for template use.
        if (this.buttonTitle != null) {

            //Prepare iterable list of button title characters to display.
            for (let i: number = 0; i < this.buttonTitle.length; i++) {

                const titleChar: string = this.buttonTitleAllowLowercase ? this.buttonTitle.charAt(i)
                                                                         : this.buttonTitle.charAt(i).toUpperCase();
                this.buttonTitleChars.push(titleChar);
            }

            this.buttonHeightPx = ( (this.buttonTitleFontSizePx + 2) * this.buttonTitle.length ) + 30;
        }
        // Title is empty, so leave iterable button title char array empty.
        else {
            this.buttonHeightPx = this.BASE_BUTTON_HEIGHT_PX;
        }
    }


    /**
     * Called whenever the slickLeftPanelButton is pressed. Handles the toggling of the slickLeftPanel when in mobile mode.
     * @param slickLeftPanel The slickLeftPanel (div) element which will be toggled in or out of the viewport.
     * @param slickLeftPanelButton The slickLeftPanelButton (button) element which was pressed.
     */
    private togglePanelVisibility(slickLeftPanel: HTMLElement, slickLeftPanelButton: HTMLElement, backDrop: HTMLElement): void {

        // If our slickLeftPanel div is outside the viewport, and we are translating it into the viewport
        if (!this.isPanelToggledIntoView(slickLeftPanel)) {
            this.toggleIntoView(slickLeftPanel, slickLeftPanelButton, backDrop);
        }
        // Else if our slickLeftPanel div is inside the viewport, and we are translating it out of the viewport (getting rid of translation).
        else {
            this.toggleOutOfView(slickLeftPanel, slickLeftPanelButton, backDrop);
        }
    }


    /**
     * Determines if the slick left panel is toggled into the viewport.
     * @param slickLeftPanel The slick left panel (div) element.
     */
    private isPanelToggledIntoView(slickLeftPanel: HTMLElement): boolean {
        // If it is in view, then there will be a translation value!
        return slickLeftPanel.classList.contains('toggle-into-view');
    }


    /**
     * Toggles the slickLeftPanel into the viewport.
     * @param slickLeftPanel The slickLeftPanel (div) element which will be toggled into the viewport.
     * @param slickLeftPanelButton The slickLeftPanelButton (button) element which was pressed.
     */
    private toggleIntoView(slickLeftPanel: HTMLElement, slickLeftPanelButton: HTMLElement, backDrop: HTMLElement): void {
        // The toggle-into-view css class contains the translation.
        slickLeftPanel.classList.add('toggle-into-view');
        slickLeftPanelButton.classList.add('hide');
        slickLeftPanelButton.classList.remove('green-glow');
        slickLeftPanelButton.style.right = '0px';
        if (this.useBackDrop)   backDrop.classList.add('show-back-drop');
        else                    backDrop.classList.add('show-transparent-back-drop');
        backDrop.onclick = this.toggleOutOfView.bind(this, slickLeftPanel, slickLeftPanelButton, backDrop);
    }


    /**
     * Toggles the slickLeftPanel out of the viewport.
     * @param slickLeftPanel The slickLeftPanel (div) element which will be toggled out of the viewport.
     * @param slickLeftPanelButton The slickLeftPanelButton (button) element which was pressed.
     */
    private toggleOutOfView(slickLeftPanel: HTMLElement, slickLeftPanelButton: HTMLElement, backDrop: HTMLElement): void {
        window.onclick = null;
        slickLeftPanel.classList.remove('toggle-into-view');
        slickLeftPanelButton.classList.add('green-glow');
        slickLeftPanelButton.classList.remove('hide');
        backDrop.classList.remove('show-back-drop');
        backDrop.classList.remove('show-transparent-back-drop');
        slickLeftPanelButton.style.right = '-' + slickLeftPanelButton.offsetWidth + 'px';
    }


    /**
     * Handles a scroll event to determine when to fix the slickLeftPanel div to the top of the viewport. We will fix it when
     * we scroll to or past the top of the slickLeftPanel div. We will unfix it when we scroll above this position once more.
     * @param event The scroll event.
     */
    /*private monitorScrollForStickyTop(event: Event): void {
        let slickLeftPanel: HTMLElement = document.getElementById('slick-left-panel'); // This can potentially get out of sync with template if id changes!
        let fixCutoff: number = this.getAbsolutePosTop(slickLeftPanel.parentElement);
        let scrollPosition: number = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);

        if (scrollPosition >= fixCutoff) {
            slickLeftPanel.style.position = 'fixed';
            slickLeftPanel.style.top = '0px';
        }
        else {
            slickLeftPanel.style.position = 'absolute';
            slickLeftPanel.style.top = 'auto';
        }
    }*/


    /**
     * Calculates the absolute position of the top of a given HTML element.
     * @param element The element to get the absolute position of.
     */
    /*private getAbsolutePosTop(element): number {
        let top: number = 0;

        do {
            top += element.offsetTop || 0;
            element = element.offsetParent;
        } while (element);

        return top;
    }*/
}
