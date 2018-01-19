import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/finally';

import { LoginService } from './login.service';
import { PasswordRecoveryService } from './password-recovery.service';

import { FoodWebResponse } from '../../../../../shared/message-protocol/food-web-response';


@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [LoginService, PasswordRecoveryService]
})
export class LoginComponent implements OnInit {

    private forgotPassword: boolean;
    private displayRecoveryResponseMessage: boolean;
    private loginForm: FormGroup;
    private loginError: string;
    private showCloseButton: boolean;
    private showProgressSpinner: boolean;


    public constructor (
        private router: Router,
        private formBuilder: FormBuilder,
        private loginService: LoginService,
        private passwordRecoveryService: PasswordRecoveryService,
        @Optional() private dialogRef?: MatDialogRef <LoginComponent>
    ) {
        this.forgotPassword = false;
        this.displayRecoveryResponseMessage = false;
        this.showCloseButton = false;
        this.showProgressSpinner = false;
    }


    public ngOnInit(): void {

        this.showCloseButton = ( this.router.url !== '/login' );

        this.loginForm = this.formBuilder.group({
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
    private loginUser(event: Event): void {

        event.preventDefault();

        let email: string = this.loginForm.value.email;
        let password: string = this.loginForm.value.password;
        let observer: Observable<FoodWebResponse> = (this.forgotPassword ? this.passwordRecoveryService.recoverPassword(email)
                                                                         : this.loginService.login(email, password));
        this.showProgressSpinner = true;

        observer.finally(() => { this.showProgressSpinner = false; })
                .subscribe (
                    (response: FoodWebResponse) => {

                        console.log(response.message);

                        if (response.success) {
                            
                            this.loginError = null;
                            this.forgotPassword ? this.displayRecoveryResponseMessage = true
                                                : (this.dialogRef != null) ? this.dialogRef.close() : undefined;

                            // If we are on login, login required, or signup page, then navigate to home on successful sign in.
                            if (this.router.url === '/login' || this.router.url === '/signup' || this.router.url === '/loginRequired') {
                                this.router.navigate(['/home']);
                            }
                        }
                        // Otherwise, failure occured.
                        else { this.loginError = response.message; }
                    },

                    (err: Error) => {
                        console.log(err); // Shouldn't happen!
                    }
                );
    }


    /**
     * Toggles between the login and forgot password form.
     */
    private toggleForgotPassword(): void {
        this.forgotPassword = !this.forgotPassword;
    }
}
