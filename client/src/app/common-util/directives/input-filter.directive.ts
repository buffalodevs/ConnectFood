import { Directive, OnInit, ElementRef, Input } from '@angular/core';
import * as _ from "lodash";
import { StringManipulation } from '../../../../../shared/common-util/string-manipulation'


@Directive({
    selector: '[InputFilter]'
})
export class InputFilterDirective implements OnInit {

    /**
     * The direct input to the directive. Should be either a string literal, String object, or RegExp object.
     * Used to filter the input of the text input control.
     */
    @Input('InputFilter') private filter: any;
    /**
     * Input true if the filter should be case sensitive. Default is false.
     */
    @Input() private caseSensitive: boolean;
    /**
     * Set to max numeric value allowed.
     */
    @Input() private max: number;
    /**
     * Set to min numeric value allowed.
     */
    @Input() private min: number;


    public constructor (
        private elementRef: ElementRef
    ) {
        this.caseSensitive = false;
    }


    public ngOnInit(): void {
        this.elementRef.nativeElement.onkeypress = this.filterKeyPress.bind(this);
    }


    /**
     * Filters a key press event by matching against the input filter string, string array, or regular expression.
     * The key press event will be cancelled if the input does not comply with the filter input.
     * @param event The key press event.
     */
    private filterKeyPress(event: KeyboardEvent): void {

        // Any characters not involved in directly adding characters to the input are immune.
        // IMPORTANT: Needed for some browsers like Firefox (doesn't automatically do this)!
        if (this.checkForImmuneKey(event))  return;

        const charPosition: number = this.getCaretPosition(this.elementRef.nativeElement);
        const keyCode: number = event.keyCode ? event.keyCode
                                              : event.which;
        let currentValue: string = this.removeSelectedChars(this.elementRef.nativeElement);
        const newValue: string = StringManipulation.insertCharAt(currentValue, String.fromCharCode(keyCode), charPosition);
        
        // If we have min and/or max number constraint(s).
        if (this.max != null || this.min != null) {

            const newNumValue: number = parseInt(newValue);

            // Check numeric range matching.
            if (    isNaN(newNumValue)
                || (this.max != null && newNumValue > this.max)
                || (this.min != null && newNumValue < this.min) )
            {  return event.preventDefault();  } // Return out of method if already non-conforming pattern found with numeric range.
        }

        // Check string filter value (either regex or substring matching).
        if (    (_.isRegExp(this.filter) && !newValue.match(this.filter))
            ||  (_.isString(this.filter) && !newValue.includes(this.caseSensitive ? this.filter
                                                                                                   : this.filter.toLowerCase()))
            ||  (_.isArray(this.filter) && !StringManipulation.isSubstringInArray(this.filter, newValue, true, this.caseSensitive)) )
        {  event.preventDefault();  }
    }


    /**
     * Checks to see if the key input from the latest key press event is immune to regular expression or substring matching.
     * A key event is immune if it does not add to the character string in the text box.
     * @param event The key press event.
     * @return true if it is immune, false if not.
     */
    private checkForImmuneKey(event: KeyboardEvent): boolean {

        const keyCode: number = (event.keyCode != null) ? event.keyCode
                                                        : event.which;

        if (    ((event.charCode == null || event.charCode < 33 || event.charCode > 40) && keyCode >= 33 && keyCode <= 40)
            ||  ((event.charCode == null || event.charCode < 16 || event.charCode > 20) && keyCode >= 16 && keyCode <= 20)
            ||  ((event.charCode == null || event.charCode < 91 || event.charCode > 93) && keyCode >= 91 && keyCode <= 93) )
        {  return true;  }

        switch(keyCode) {
            case 45:    break; // insert
            case 46:    break; // delete
            case 9:     break; // tab
            case 27:    break; // escape
            case 8:     break; // backspace
            case 13:    break; // enter
            default:    return false;
        }

        return true;
    }


    /**
     * Gets the caret potion in a given input element.
     * @param input The HTML Input Element from which to get the caret position.
     * @return The caret position.
     */
    private getCaretPosition(input: HTMLInputElement): number {
        return this.getSelectRange(input).start;
    }


    /**
     * Takes a string from a given input element and removes the selected characters from it.
     * @param input The input element.
     * @return The string with selected characters removed.
     */
    private removeSelectedChars(input: HTMLInputElement): string {

        let inputVal: string = input.value;
        let selectRange = this.getSelectRange(input);
        
        return inputVal.substr(0, selectRange.start) + inputVal.substr(selectRange.end);
    }


    /**
     * Gets the text selection range for a given input element.
     * Credit goes to: https://stackoverflow.com/questions/3053542/how-to-get-the-start-and-end-points-of-selection-in-text-area
     * @param input The input element to get the text selection range form.
     * @return A text selection range with character index start and end members.
     */
    private getSelectRange(input: HTMLInputElement): { start: number, end: number } {

        input.focus(); // Focus first to be safe

        let start: number = 0, end: number = 0, normalizedValue, range,
            textInputRange, len, endRange;
    
        if (typeof input.selectionStart == "number" && typeof input.selectionEnd == "number") {
            start = input.selectionStart;
            end = input.selectionEnd;
        }
        else {

            let ieDocSupport: any = document;
            range = (ieDocSupport.selection) ? ieDocSupport.selection.createRange() : undefined;
    
            if (range && range.parentElement() == input) {

                len = input.value.length;
                normalizedValue = input.value.replace(/\r\n/g, "\n");
    
                // Create a working TextRange that lives only in the input
                textInputRange = (<any>input).createTextRange();
                textInputRange.moveToBookmark(range.getBookmark());
    
                // Check if the start and end of the selection are at the very end
                // of the input, since moveStart/moveEnd doesn't return what we want
                // in those cases
                endRange = (<any>input).createTextRange();
                endRange.collapse(false);
    
                if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                    start = end = len;
                }
                else {

                    start = -textInputRange.moveStart("character", -len);
                    start += normalizedValue.slice(0, start).split("\n").length - 1;
    
                    if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                        end = len;
                    }
                    else {
                        end = -textInputRange.moveEnd("character", -len);
                        end += normalizedValue.slice(0, end).split("\n").length - 1;
                    }
                }
            }
        }
    
        return {
            start: start,
            end: end
        };
    }
}
