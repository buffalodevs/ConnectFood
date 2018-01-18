import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { SlickTypeaheadService } from './slick-type-ahead.service';


@NgModule({
    imports: [
        CommonModule,
        NgbTypeaheadModule
    ],
    exports: [
        NgbTypeaheadModule
    ],
    providers: [
        SlickTypeaheadService
    ]
})
export class SlickTypeaheadModule {}
