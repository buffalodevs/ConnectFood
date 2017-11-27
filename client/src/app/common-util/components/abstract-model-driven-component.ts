import { FormGroup, AbstractControl } from "@angular/forms";

import { ValidationService } from "../services/validation.service";


export abstract class AbstractModelDrivenComponent {

    /**
     * The base or primary form for the component.
     */
    protected form: FormGroup;


    protected constructor (
        /**
         * The validation service for this component.
         */
        protected validationService: ValidationService
    ) { }


    /**
     * Gets a control using a given control path based in the base form object.
     * @param controlPath The path to the control relative to the base form object.
     * @return The control.
     */
    protected control(controlPath: string): AbstractControl {
        return this.form.get(controlPath);
    }


    /**
     * Determines if a given control has any error(s).
     * @param controlPath The path of the control relative to the base signupForm.
     * true if an error(s) exist, false if not.
     */
    protected hasError(controlPath: string): boolean {
        return ( this.control(controlPath).errors != null );
    }


    /**
     * Generates an error message for a given control (assuming the control has an error).
     * @param controlPath The path of the control relative to the base signupForm.
     * @return The error message for the given control.
     */
    protected errorMsgFor(controlPath: string): string {
        return this.validationService.errorMsgFor(this.form.get(controlPath), controlPath);
    }
}
