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
     * Default is true. Determines whether or not to use the backdrop.
     */
    @Input() private showBackdrop: boolean;
    /**
     * The Promise/Observable that the progress spinner should display during.
     */
    @Input('slick-progress-spinner') private showDuring: PromiseLike<any>;
    /**
     * An optional extra show condition.
     */
    @Input() private showCondition: boolean;

    private showSpinner: boolean;


    public constructor() {

        this.color = 'accent';
        this.mode = 'indeterminate';

        this.delayMs = 0;
        this.showBackdrop = true;
        this.showDuring = null;
        this.showCondition = true;
        this.showSpinner = false;
    }


    public ngOnChanges(changes: SimpleChanges): void {
        
        if (changes.showDuring.currentValue != null) {

            let wasResolved: boolean = false;

            // Listen for Promise/Observable to resolve so we can stop showing progress spinner then.
            this.showDuring.then(() => {
                wasResolved = true;
                this.showSpinner = false
            });

            // Wait until the specified delay from parent component to show the progress spinner (if promise hasn't resolved).
            setTimeout(() => {
                if (!wasResolved && this.showCondition) this.showSpinner = true
            }, this.delayMs);
        }
    }
}
