import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { StringManipulation } from '../../../../../../shared/common-util/string-manipulation';


@Component({
    selector: '[slick-progress-spinner]',
    templateUrl: './slick-progress-spinner.component.html',
    styleUrls: ['./slick-progress-spinner.component.css']
})
export class SlickProgressSpinnerComponent implements OnChanges {

    // For follwing, see Angular Material's MatSpinner component documentation!
    @Input() private color: string;
    @Input() private mode: string;
    @Input() private value: number;
    @Input() private maxWidth: number | string;
    @Input() private maxHeight: number | string

    /**
     * Default is 0 ms. The delay time before the progress spinner is displayed.
     */
    @Input() private delayMs: number;
    /**
     * Default value is 0. The minimum duration that the progress spinner must show for.
     */
    @Input() private minDurationMs: number;
    /**
     * Default is true. Determines whether or not to use the backdrop.
     */
    @Input() private showBackdrop: boolean;
    /**
     * Triggers the display of the progress spinner if set true once delayMs has elapsed. Stops display if set false after minDurationMs has elapsed.
     */
    @Input('slick-progress-spinner') private triggerShowSpinner: boolean;
    /**
     * An optional extra show condition.
     */
    @Input() private showCondition: boolean;
    /**
     * Default is false. Set to true if testing spinner and it should be permanently displayed once first triggered.
     */
    @Input() private spinnerTest: boolean;

    private showSpinner: boolean;


    public constructor() {

        this.color = 'accent';
        this.mode = 'indeterminate';
        this.maxWidth = '100%';
        this.maxHeight = '100%';

        this.delayMs = 0;
        this.minDurationMs = 0;
        this.showBackdrop = true;
        this.triggerShowSpinner = false;
        this.showCondition = true;
        this.spinnerTest = false;
        this.showSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {

        // Ensure width is converted to style string if it is a number.
        if (changes.maxWidth && this.maxWidth != null) {

            this.maxWidth = StringManipulation.isString(this.maxWidth) ? this.maxWidth
                                                                       : this.maxWidth + 'px';
        }

        // Ensure height is converted to style string if it is a number.
        if (changes.maxHeight && this.maxHeight != null) {

            this.maxHeight = StringManipulation.isString(this.maxHeight) ? this.maxHeight
                                                                         : this.maxHeight + 'px';
        }
        
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
            }, this.triggerShowSpinner ? this.delayMs
                                       : this.minDurationMs);
        }
    }
}
