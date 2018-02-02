import { FormGroup, AbstractControl } from "@angular/forms";

import { ValidationService } from "../services/validation.service";


export abstract class AbstractModelDrivenComponent {

    /**
     * The base or primary form for the component.
     */
    public form: FormGroup;


    protected constructor (
        /**
         * The validation service for this component.
         */
        public validationService: ValidationService
    ) {}


    /**
     * Gets a control using a given control path based in the base form object.
     * @param controlPath The path to the control relative to the base form object.
     * @return The control.
     */
    public control(controlPath: string): AbstractControl {
        return this.form.get(controlPath);
    }


    /**
     * Determines if a given control has any error(s).
     * @param controlPath The path of the control relative to the base form.
     * @param errorCode An optional error code to check for if a specific error is being examined. Default is null for any error.
     * true if an error(s) exist, false if not.
     */
    public hasError(controlPath: string, errorCode?: string): boolean {

        let control: AbstractControl = (controlPath === '.') ? this.form
                                                             : this.control(controlPath);

        return ( control.errors != null && (errorCode == null || control.hasError(errorCode)));
    }


    /**
     * Generates an error message for a given control (assuming the control has an error).
     * @param controlPath The path of the control relative to the base form.
     * @return The error message for the given control.
     */
    public errorMsgFor(controlPath: string): string {

        let control: AbstractControl = (controlPath === '.') ? this.form
                                                             : this.control(controlPath);

        return this.validationService.errorMsgFor(control, controlPath);
    }
}
