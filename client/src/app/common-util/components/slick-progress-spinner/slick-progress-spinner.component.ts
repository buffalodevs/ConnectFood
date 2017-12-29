import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';


@Component({
    selector: '[slick-progress-spinner]',
    templateUrl: './slick-progress-spinner.component.html',
    styleUrls: ['./slick-progress-spinner.component.css']
})
export class SlickProgressSpinnerComponent implements OnChanges {

    // For follwing, see Angular Material's MdSpinner component documentation!
    @Input() private color: string;
    @Input() private mode: string;
    @Input() private value: number;

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

        this.delayMs = 0;
        this.minDurationMs = 0;
        this.showBackdrop = true;
        this.triggerShowSpinner = false;
        this.showCondition = true;
        this.spinnerTest = false;
        this.showSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
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
