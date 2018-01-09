import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { TypeaheadService } from './type-ahead.service';


@NgModule({
    imports: [
        CommonModule,
        NgbTypeaheadModule
    ],
    exports: [
        NgbTypeaheadModule
    ],
    providers: [
        TypeaheadService
    ]
})
export class SlickTypeaheadModule {}
