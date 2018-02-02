import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as _ from "lodash";


@Component({
    selector: '[slick-progress-spinner]',
    templateUrl: './slick-progress-spinner.component.html',
    styleUrls: ['./slick-progress-spinner.component.css']
})
export class SlickProgressSpinnerComponent implements OnChanges {

    // For follwing, see Angular Material's MatSpinner component documentation!
    @Input() public spinnerColor: string;
    @Input() public spinnerMode: string;
    @Input() public spinnerValue: number;

    /**
     * Default is 0 ms. The delay time before the progress spinner is displayed.
     */
    @Input() public spinnerDelayMs: number;
    /**
     * Default value is 0. The minimum duration that the progress spinner must show for.
     */
    @Input() public spinnerMinDurationMs: number;
    /**
     * Default is true. Determines whether or not to use the backdrop.
     */
    @Input() public showSpinnerBackdrop: boolean;
    /**
     * The color of the backdrop (in css background style format).
     * Default is 'rgba(211, 211, 211, 0.5)' for semi-transparent lightgray.
     */
    @Input() public spinnerBackdropColor: string;
    /**
     * Triggers the display of the progress spinner if set true once delayMs has elapsed. Stops display if set false after minDurationMs has elapsed.
     */
    @Input('slick-progress-spinner') public triggerShowSpinner: boolean;
    /**
     * An optional extra show condition.
     */
    @Input() public showSpinnerCondition: boolean;
    /**
     * ID of the container for a sticky top spinner. If given, then the spinner will have stick top behavior inside the given container.
     */
    @Input() public spinnerStickyTopId: string;
    /**
     * Default is false. Set to true if testing spinner and it should be permanently displayed once first triggered.
     */
    @Input() public spinnerTest: boolean;

    public showSpinner: boolean;


    public constructor() {

        this.spinnerColor = 'accent';
        this.spinnerMode = 'indeterminate';

        this.spinnerDelayMs = 0;
        this.spinnerMinDurationMs = 0;
        this.showSpinnerBackdrop = true;
        this.spinnerBackdropColor = 'rgba(211, 211, 211, 0.5)';
        this.triggerShowSpinner = false;
        this.showSpinnerCondition = true;
        this.spinnerStickyTopId = null;
        this.spinnerTest = false;
        this.showSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        // Whenever the triggerShowSpinner flag changes, we must set timeout for spinner display change.
        if (changes.triggerShowSpinner) {

            // If change is to null/undefined, then set to false.
            if (this.triggerShowSpinner == null) {

                this.triggerShowSpinner = false;
                // If change is to null/undefined, and previous value was false, then simply return / do nothing.
                if (changes.triggerShowSpinner.previousValue === !this.triggerShowSpinner) return;
            }

            // Wait for delay to show/hide progress spinner.
            setTimeout(() => {
                this.showSpinner = (!this.spinnerTest || this.triggerShowSpinner) ? this.triggerShowSpinner
                                                                                  : true; // Always true if spinnerTest is set!
            }, this.triggerShowSpinner ? this.spinnerDelayMs
                                       : this.spinnerMinDurationMs);
        }
    }
}
