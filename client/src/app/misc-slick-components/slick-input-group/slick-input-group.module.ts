import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickInputGroupComponent } from './slick-input-group.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        SlickInputGroupComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        SlickInputGroupComponent
    ]
})
export class SlickInputGroupModule {}
