import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Observable } from "rxjs/Observable";
import { NGXLogger } from 'ngx-logger';
import 'rxjs/add/operator/finally';

import { LoginService } from './login.service';
import { PasswordRecoveryService } from './password-recovery.service';

import { FoodWebResponse } from '../../../../../shared/src/message-protocol/food-web-response';
import { AbstractModelDrivenComponent } from '../../common-util/components/abstract-model-driven-component';
import { ValidationService } from '../../common-util/services/validation.service';


@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [LoginService, PasswordRecoveryService]
})
export class LoginComponent extends AbstractModelDrivenComponent implements OnInit {

    public forgotPassword: boolean = false;
    public displayRecoveryResponseMessage: boolean = false;
    public loginError: string = null;
    public showCloseButton: boolean = false;
    public showProgressSpinner: boolean = false;


    get dialogRef(): MatDialogRef <LoginComponent> {
        return this._dialogRef;
    }


    public constructor (
        private _router: Router,
        private _loginService: LoginService,
        private _passwordRecoveryService: PasswordRecoveryService,
        private _logger: NGXLogger,
        validationService: ValidationService,
        formBuilder: FormBuilder,
        @Optional() private _dialogRef?: MatDialogRef <LoginComponent>
    ) {
        super(validationService, formBuilder);

        this.forgotPassword = false;
        this.displayRecoveryResponseMessage = false;
        this.showCloseButton = false;
        this.showProgressSpinner = false;
    }


    public ngOnInit(): void {

        this.showCloseButton = ( this._router.url !== '/login' );

        this.form = this._formBuilder.group({
            email: [null, Validators.required],
            password: null
        });
    }


    /**
     * Displays the login dialog.
     * @param globalDialogService The global dialog service used to display the dialog popup and associated back-drop.
     * @return A promise that is resolved when a modal is closed and rejected when a modal is dismissed.
     */
    public static display(dialog: MatDialog): Observable <any> {

        let dialogConfig: MatDialogConfig = new MatDialogConfig();
        dialogConfig.maxWidth = 400;
        dialogConfig.hasBackdrop = true;
        dialogConfig.backdropClass = 'login-dialog-backdrop';
        dialogConfig.panelClass = 'login-dialog';
        dialogConfig.autoFocus = false;

        return dialog.open(LoginComponent, dialogConfig).afterClosed();
    }


    /**
     * Performs the login via the Login Service.
     * @param event The form submit or click event that triggered this function.
     */
    public loginUser(event: Event): void {

        event.preventDefault();

        let email: string = this.form.value.email;
        let password: string = this.form.value.password;
        let observer: Observable<FoodWebResponse> = (this.forgotPassword ? this._passwordRecoveryService.recoverPassword(email)
                                                                         : this._loginService.login(email, password));
        this.showProgressSpinner = true;

        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (response: FoodWebResponse) => {

                        if (response.success) {
                            
                            this.loginError = null;
                            this.forgotPassword ? this.displayRecoveryResponseMessage = true
                                                 : (this.dialogRef != null) ? this.dialogRef.close() : undefined;

                            // If we are on login, login required, or signup page, then navigate to home on successful sign in.
                            if (this._router.url === '/login' || this._router.url === '/signup' || this._router.url === '/loginRequired') {
                                this._router.navigate(['/home']);
                            }
                        }
                        // Otherwise, failure occured.
                        else { this.loginError = response.message; }
                    },

                    (err: Error) => {
                        this._logger.error(err); // Shouldn't happen!
                    }
                );
    }


    /**
     * Toggles between the login and forgot password form.
     */
    public toggleForgotPassword(): void {
        this.forgotPassword = !this.forgotPassword;
    }


    /**
     * Closes the dialog.
     */
    public close(): void {

        if (this._dialogRef != null) {
            this._dialogRef.close();
        }
    }
}
