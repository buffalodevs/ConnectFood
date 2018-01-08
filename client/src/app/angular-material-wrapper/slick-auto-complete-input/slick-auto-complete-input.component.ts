import { Component, Input, OnInit, AfterViewInit, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { MatAutocomplete, MatOption } from '@angular/material';

import { StringManipulation } from '../../../../../shared/common-util/string-manipulation';


@Component({
    selector: 'slick-auto-complete-input',
    templateUrl: './slick-auto-complete-input.component.html',
    styleUrls: ['./slick-auto-complete-input.component.css'],
    providers: [
        { 
          provide: NG_VALUE_ACCESSOR,
          multi: true,
          useExisting: forwardRef(() => SlickAutoCompleteInputComponent),
        }
    ]
})
export class SlickAutoCompleteInputComponent implements OnInit, AfterViewInit {

    // Standard html attributes.
    @Input() private containerId: string;
    @Input() private inputId: string;
    @Input() private autoCompleteId: string;
    @Input() private containerClass: string;
    @Input() private inputClass: string;
    @Input() private autoCompleteClass: string;
    @Input() private type: string;
    @Input() private maxlength: string;
    @Input() private max: string;
    @Input() private min: string;
    @Input() private placeholder: string;
    @Input() private floatPlaceholder: string;

    
    /**
     * The form control that is to be bound to the contained input field.
     */
    @Input() private inputControl: FormControl;
    /**
     * A list of auto-complete data to display when focusing on the input control.
     */
    @Input() private autoCompleteData: string[];
    /**
     * Determines whether or not to filter the auto-complete data based on the current text input data.
     * Default is false for do not filter.
     */
    @Input() private autoCompleteFilter: boolean;
    /**
     * Determines whether or not to bring auto complete matches to the top of the auto complete selection.
     * Default is true for enable.
     */
    @Input() private autoCompleteFloat: boolean;
    /**
     * Set to true to highlight the first auto complete item on a text input change, and to false to not do so.
     * Default is true.
     */
    @Input() private highlightFirstMatch: boolean;
    /**
     * Set to true if the matching between input and auto complete should be case sensitive. Default is false.
     */
    @Input() private caseSensitiveMatch: boolean;
    /**
     * Filter for allowing only certain key combinations to be entered into the input field.
     */
    @Input() private inputFilter: string | string[] | RegExp;
    /**
     * Set to true if the final input result upon form submission must fully match an auto complete entry. Default is false.
     */
    @Input() private mustMatchAutoComplete: boolean;
    /**
     * Set to true if the highlighted (active) auto complete element should be selected on blur.
     * Default is false.
     */
    @Input() private selectOnBlur: boolean;


    @ViewChild('autoComplete') private autoCompleteComponent: MatAutocomplete;


    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (value: string) => void;
    /**
     * Filtered auto-complete data based on what is present in input field.
     * NOTE: If autoCompleteFilter is not set to true, then this should always remain equal to the autoCompleteData input!
     */
    private filtAutoCompleteData: string[];


    public constructor() {

        this.inputId = 'slick-auto-complete-input';
        this.autoCompleteId = 'slick-auto-complete';
        this.type = 'text';
        this.floatPlaceholder = 'auto';
        this.autoCompleteFilter = false;
        this.autoCompleteFloat = true;
        this.highlightFirstMatch = true;
        this.caseSensitiveMatch = false;
        this.mustMatchAutoComplete = false;
        this.selectOnBlur = false;
        this.onChange = (value: any) => {}; // If no change listener given later, then all change will be swallowed here!
    }


    public ngOnInit(): void {

        if (this.inputControl == null)  throw new Error('inputControl component input cannot be null. Did you incorrectly bind to inputControlName or inputControl instead?')

        // Check to see if input filter should be based on auto complete data.
        if (this.mustMatchAutoComplete) {
            this.inputFilter = this.autoCompleteData;
        }

        this.filtAutoCompleteData = this.autoCompleteData;
        this.inputControl.valueChanges.subscribe(this.listenForChange.bind(this));
    }


    /**
     * Sets up tab key listener so that the highlighted auto complete element will be highlighted when tab is pressed.
     */
    public ngAfterViewInit(): void {
        
        // When the tab key is hit to change focus, then select whatever option is highlighted.
        this.autoCompleteComponent._keyManager.tabOut.subscribe(() => {
            this.selectHighlightedElement();
        });
    }


    /**
     * Handles the blur of the input conrol (when it loses focus).
     */
    private handleBlur(): void {
        if (this.selectOnBlur)  this.selectHighlightedElement();
    }


    /**
     * Selects the highlighted auto complete element.
     */
    private selectHighlightedElement(): void {

        const selectOption: MatOption = this.autoCompleteComponent._keyManager.activeItem;
        if (selectOption != null)  selectOption.select();
    }


    /**
     * Listens for the input value to update.
     * @param value The updated value of the input.
     */
    private listenForChange(value: string): void {

        if (value == null)  return; // If the value is null, we are uninterested in it! Only interested in string (including empty string).

        let newValue: string = this.inputControl.value;

        // Reset filtered auto complete data state to be the full oriignal ordered auto complete data.
        this.filtAutoCompleteData = this.autoCompleteData.slice(); // Copy array elements over!

        // Apply any selected filter or reordering schemes on auto complete data.
        if (value.length !== 0) {

            if      (this.autoCompleteFilter)  this.filterAutoComplete(newValue);
            else if (this.autoCompleteFloat)   this.floatAutoCompleteMatches(newValue);
        }

        // Highlight first match (by setting active).
        if (this.highlightFirstMatch) {
            this.highlightMatch(value);
        }
    }

    
    /**
     * Filters the auto complete data based on the new given value of the input control.
     * @param value The new value of the input control.
     */
    private filterAutoComplete(value: string): void {
        this.filtAutoCompleteData = StringManipulation.filterBySubstring(this.autoCompleteData, value, this.caseSensitiveMatch);
    }


    /**
     * Causes auto complete (partial and full) matches to float to the top. Matches that more closesly match the input
     * float higher than others. Auto complete entries that don't match stay where they are.
     * @param value The input value.
     */
    private floatAutoCompleteMatches(value: string): void {
        this.filtAutoCompleteData = StringManipulation.sortByStringSimilarity(this.filtAutoCompleteData, value, this.caseSensitiveMatch);
    }


    /**
     * Highlights the first auto complete match within filtered data (if there is one).
     * @param value THe value to match against.
     */
    private highlightMatch(value: string): void {

        // If we are using filters and the first auto complete element (partially or fully) matches the input value.
        if (value.length !== 0 && this.isAutoCompleteFilterSet() && StringManipulation.checkForSubstring(this.filtAutoCompleteData[0], value, this.caseSensitiveMatch)) {
            this.setHighlightInd(0);
        }

        // Else if we are not using any filters, then check each element for nearest match.
        else if (value.length !== 0 && !this.isAutoCompleteFilterSet()) {
            const closestMatchInd: number = StringManipulation.getSubstringMatchInd(this.filtAutoCompleteData, value, 0, true, false, this.caseSensitiveMatch);
            this.setHighlightInd(closestMatchInd)
        }
        
        // Else remove any active highlight.
        else {
            this.setHighlightInd(null);
        }
    }


    /**
     * Determines if some filter is set for the auto complete.
     * @return true if one is set, false if not.
     */
    private isAutoCompleteFilterSet(): boolean {
        return ( this.autoCompleteFilter || this.autoCompleteFloat );
    }


    /**
     * Sets the active highlight index for the auto complete.
     * @param highlightInd The active highlight index.
     */
    private setHighlightInd(highlightInd: number): void {

        setTimeout(() => {

            if (this.autoCompleteComponent.panel == null)  return;
            const optionHeight: number = ( this.autoCompleteComponent.panel.nativeElement.scrollHeight / this.filtAutoCompleteData.length );
            
            this.autoCompleteComponent._keyManager.setActiveItem(highlightInd);
            this.autoCompleteComponent._setScrollTop(((highlightInd != null) ? highlightInd : 0) * optionHeight);
        }, 0);
    }
}
