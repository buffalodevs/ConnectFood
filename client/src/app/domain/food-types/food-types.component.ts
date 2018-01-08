import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, forwardRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { ActivatedRoute } from "@angular/router";

import { FoodTypesService } from "./food-types.service";


@Component({
    selector: 'food-types',
    templateUrl: './food-types.component.html',
    styleUrls: ['./food-types.component.css'],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FoodTypesComponent),
            multi: true
        }
    ]
})
export class FoodTypesComponent implements OnInit, OnChanges, ControlValueAccessor {

    /**
     * If set to true, then this component will be used to merely display a list of Food Types.
     */
    @Input() private displayOnly: boolean;
    /**
     * Set to true if the display only Food Types should be a condensed list.
     * The condensed list only includes Food Types that have been selected.
     */
    @Input() private condensedDisplay: boolean;
    /**
     * Determines if the Food Type checkboxes should initially be checked. Default is true.
     */
    @Input() private initiallyChecked: boolean;
    /**
     * The maximum number of elements per column (if reached, will generate another column). Default is 6.
     * NOTE: Will not generate more than 4 columns, so if no more columns can be made, then this is ignored!
     */
    @Input() private maxElementsPerColumn: number;
    /**
     * The maximum number of columns that the Food Types checkboxes will be displayed in. Default is 2.
     */
    @Input() private maxNumColumns: number;
    /**
     * Determines if at least one selection is required. Default is false.
     */
    @Input() private required: boolean;
    /**
     * Triggers validation of the form by marking all as touched.
     */
    @Input() private validate: boolean;
    /**
     * Any extra required validation constraint. Ignored on default.
     */
    @Input() private extraValidation: boolean;

    private foodTypes: string[];
    private selectedFoodTypes: string[];
    private foodTypesForm: FormGroup;
    private foodTypeIndsColumns: number[][];

    /**
     * A callback function provided by a parent component (via directive such as ngModel).
     * ControlValueAccessor interface's registerOnChange method is used to register this callback.
     */
    private onChange: (selectedFoodTypes: string[]) => void;

    
    public constructor (
        // private routerSnapshot: ActivatedRoute,
        private foodTypesService: FoodTypesService
    ) {
        this.displayOnly = false;
        this.condensedDisplay = false;
        this.initiallyChecked = true;
        this.maxElementsPerColumn = 6;
        this.maxNumColumns = 2;
        this.required = false;
        this.validate = false;
        this.extraValidation = true;

        this.selectedFoodTypes = [];
        // Simply initialize empty form here. We will fill it with Food Types from server (or client cache) in ngOnInit()!
        this.foodTypesForm = new FormGroup({});
        this.foodTypeIndsColumns = [];
    }


    public ngOnInit(): void {
        // this.foodTypes = this.routerSnapshot.data['value']['foodTypes'];

        /*  Ideally, this should resolve immediately because of a resolver used in route to parent component! The Food Types should have
            already been fetched and cached from the server before this component was initialized and rendered, but just in case we will
            call getFoodTypes instead of directly getting results form router snapshop (like shown above in commment). */
        this.foodTypesService.getFoodTypes().subscribe((foodTypes: string[]) => {

            // Set all base food types and their initial checked states.
            this.foodTypes = foodTypes;
            this.setToInitialCheckedState();

            // Set initial display column data.
            this.generateColumns();

            // Register listener for changes in the contained checkbox form's values.
            this.foodTypesForm.valueChanges.subscribe(this.valueChangesListener.bind(this));
            this.foodTypesForm.updateValueAndValidity(); /* When finished adding all food type controls, then trigger a value update
                                                            so callback will get the selected food types. */
        });
    }


    /**
     * Listens for changes in Component Input instance variables.
     */
    public ngOnChanges(changes: SimpleChanges): void {

        // If the validate input was changed to true, then trigger form validation.
        if (changes.validate && this.validate) {
            this.foodTypesForm.markAsTouched();
        }
        
        // If display column constraints change, then regenerate columns.
        if (changes.maxNumColumns || changes.maxElementsPerColumn || changes.condensedDisplay) {
            this.generateColumns();
        }
    }


    /**
     * This listener will be invoked whenever a Food Type checkbox is modified, will construct a Food Types string array,
     * and will pass it to the parent component via the listener it has registered with this
     * (child) component via directive (such as ngModel). The parent originally registers its
     * listener via the registerOnChange function which is part of the ControlValueAccessor interface.
     */
    private valueChangesListener(): void {

        // On every change, updated array of selected Food Types irregardless of existence of onChange listener.
        this.selectedFoodTypes = this.foodTypesService.getFoodTypesAssocWithTrue(this.foodTypesForm.value);

        // Update display columns whenever the value changes if only displaying selected Food Types.
        if (this.isCondesnedDisplayOnlyMode()) {
            this.generateColumns();
        }

        // Push changes to parent if it has registered an onChange listener (via ngModel or formControl).
        if (this.onChange != null) this.onChange(this.selectedFoodTypes);
    }


    /**
     * Determines if this component is configured for condesned display only mode.
     * @return true if it is, false if not.
     */
    private isCondesnedDisplayOnlyMode(): boolean {
        return (this.displayOnly && this.condensedDisplay);
    }


    /**
     * Writes a new value to the contained view model. This function is part of the ControlValueAccessor
     * interface and is implicitely called by directives (such as ngModel) when the data within this component
     * should be updated by a parent component.
     * @param foodTypes The Food Types that are to be set true to signify being present. In the display only view,
     *                  these Food Types will be the only ones that are present. In a non-display only view,
     *                  these Food Types will simply be checked off (and present among all others as well).
     */
    public writeValue(selectedFoodTypes: string[]): void {

        // Ingore undefined values!
        if (selectedFoodTypes === undefined) return;

        // If given a non-null value, then write it.
        if (selectedFoodTypes !== null) {

            // First set all Food Types to false.
            for (let i: number = 0; i < this.foodTypes.length; i++) {
                this.foodTypesForm.controls[this.foodTypes[i]].setValue(false, { emitEvent: false});
            }

            // Set only selected Food Types to true now.
            for (let i: number = 0; i < selectedFoodTypes.length; i++) {
                this.foodTypesForm.controls[selectedFoodTypes[i]].setValue(true, { emitEvent: false });
            }

            this.foodTypesForm.updateValueAndValidity(); // trigger valueChanges so parent gets updated values and selectedFoodTypes updated.
        }
        // Else we were given null, so set contained value back to original checked (boolean) state.
        else {
            this.reset();
        }
    }


    /**
     * Resets the checkboxes to their initial checked value. Also resets any associated validation.
     */
    public reset(): void {
        this.setToInitialCheckedState();
        this.foodTypesForm.markAsPristine();
        this.foodTypesForm.markAsUntouched();
    }


    /**
     * Sets the internal check (boolean) values to the initiallyChecked state. Creates form controls if they do not yet exist.
     */
    private setToInitialCheckedState(): void {
        
        for (let i: number = 0; i < this.foodTypes.length; i++) {

            // If control already exists, then simply reset its value!
            if (this.foodTypesForm.contains(this.foodTypes[i])) {
                this.foodTypesForm.get(this.foodTypes[i]).setValue(this.initiallyChecked, { emitEvent: false });
            }
            // Otherwise, we need to add the new control.
            else {
                this.foodTypesForm.addControl(this.foodTypes[i], new FormControl(this.initiallyChecked));
            }
        }

        this.foodTypesForm.updateValueAndValidity(); // trigger valueChanges so parent gets updated values and selectedFoodTypes updated.
    }


    /**
     * Provides a callback function that shall be invoked whenever there is an update to this component's Food Types view model.
     * @param onChange The callback function invoked on any change to contained Food Types data.
     */
    public registerOnChange(onChange: (selectedFoodTypes: string[]) => void): void {
        this.onChange = onChange;
    }


    /**
     * 
     * @param onTouched 
     */
    public registerOnTouched(onTouched: any): void {}


    /**
     * Gets the currently selected Food Types.
     * @return A list of the currently selected Food Types.
     */
    public getSelectedFoodTypes(): string[] {
        return this.selectedFoodTypes;
    }


    /**
     * Determines whether or not an error exists in the Food Types form (only after being touched by user or instructed to validate by parent).
     * @return true if an error exists, false if not.
     */
    private hasError(): boolean {
        return ( (this.foodTypesForm.touched || this.validate) && this.required && this.selectedFoodTypes.length === 0 && this.extraValidation );
    }


    /**
     * Creates an array/range containing incremental integers representing each column (for *ngFor column iterations).
     * @return The array or range of column numbers.
     */
    private generateColumns(): void {

        this.foodTypeIndsColumns = [];
        
        // If initialized and Food Types are non-null, then actually calculate.
        if (this.foodTypes != null) {

            // Calculate the preferred number of columns that will be used for display.
            const numColumns: number = this.calcNumColumns();
            
            for (let i: number = 0; i < numColumns; i++) {
                this.foodTypeIndsColumns.push(this.getFoodTypeIndsForColumn(i, numColumns));
            }
        }
    }


    /**
     * Determines the preferrable number of columns based on the number of display Food Types and the max number of columns configured.
     * @return the preferred number of columns.
     */
    private calcNumColumns(): number {

        const numDisplayFoodTypes: number = this.isCondesnedDisplayOnlyMode() ? this.selectedFoodTypes.length
                                                                              : this.foodTypes.length;
        const numDivisions: number = Math.ceil(numDisplayFoodTypes / this.maxElementsPerColumn);

        // If max number of columns exceeds the number of divisions, then set it to number of divisions, otherwise max number of columns.
        return (numDivisions < this.maxNumColumns) ? numDivisions
                                                   : this.maxNumColumns;
    }


    /**
     * Creates an array/range containing incremental integers representing the Food Types array indexes of all Food Types that should be placed in a given column.
     * @param column The column that the numeric range shall be generated for (columns are zero based!).
     * @param numColumns The total number of columns.
     * @return The array or range of Food Type indexes that are to be rendered in the column.
     */
    private getFoodTypeIndsForColumn(column: number, numColumns: number): number[] {
        
        let range: number[] = [];

        if (this.foodTypes != null) {

            // The Food Types that are to be displayed depend on the displayOnly and condensedDisplay settings.
            let displayFoodTypes: string[] = this.isCondesnedDisplayOnlyMode() ? this.selectedFoodTypes
                                                                               : this.foodTypes;

            /*  Calculate the number of extra Food Types that must be added to the first column if the total number of Food TYpes is not
                evenly divisble by the number of columns! Also, all other ranges (column begins) must be offset by this amount! */
            let remainder: number = (displayFoodTypes.length % numColumns);

            // Base range parameters off of number of columns specified by parent component and the number of Food Types from server.
            let rangeLength: number = Math.floor(displayFoodTypes.length / numColumns);
            let rangeBegin: number = (column * rangeLength) + (column !== 0 ? remainder : 0);
            let rangeEnd: number = (rangeBegin + rangeLength) + (column === 0 ? remainder : 0);

            for (let i: number = rangeBegin; i < rangeEnd; i++) {
                // Get the index of the FoodType to display from the core foddTypes list (may not align if using condesnedDisplay mode).
                const lastFoodTypeIndex: number = (range.length > 0) ? range[range.length - 1] : null;
                const indexOfDisplayFoodType: number = this.foodTypes.indexOf(displayFoodTypes[i], lastFoodTypeIndex);
                range.push(indexOfDisplayFoodType);
            }
        }

        return range;
    }
}
