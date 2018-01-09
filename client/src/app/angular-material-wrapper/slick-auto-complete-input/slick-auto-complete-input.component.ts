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
export class SlickAutoCompleteInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {

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
     * View model for contained input control.
     */
    private inputControl: FormControl;
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
        this.inputControl = new FormControl();
    }


    public ngOnInit(): void {

        // Check to see if input filter should be based on auto complete data.
        if (this.mustMatchAutoComplete) {
            this.inputFilter = this.autoCompleteData;
        }

        this.filtAutoCompleteData = this.autoCompleteData; // The input control is blank, so no filter applied yet.
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
     * Writes a value to the underlying input control.
     * @param value The new value to write.
     */
    public writeValue(value: string): void {
        this.inputControl.setValue(value);
    }


    /**
     * Registers a change listener in the underlying input control.
     * Associated with ngModel or formControl directives.
     * @param onChange The change listener function.
     */
    public registerOnChange(onChange: (value: string) => void): void {
        this.onChange = onChange;
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

            // Does the first element match the input (contain input as substring at least)?
            const firstMatchesInput: boolean = value.length !== 0 && this.isFilterOrFloatSet()
                                             && StringManipulation.checkForSubstring(this.filtAutoCompleteData[0], value, this.caseSensitiveMatch);
            if (firstMatchesInput)  this.highlightFirstOption();
        }

        // Notify parent component's listener of change.
        this.onChange(value);
    }


    /**
     * Sets the active highlight index to the first option of the auto complete.
     */
    private highlightFirstOption(): void {

        setTimeout(() => {

            if (this.autoCompleteComponent.panel == null)  return;            
            this.autoCompleteComponent._keyManager.setFirstItemActive();
        }, 100);
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
     * Determines if some filter is set for the auto complete.
     * @return true if one is set, false if not.
     */
    private isFilterOrFloatSet(): boolean {
        return ( this.autoCompleteFilter || this.autoCompleteFloat );
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


    public registerOnTouched(fn: any): void {}
}
