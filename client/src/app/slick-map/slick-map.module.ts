import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { SlickMapComponent } from './slick-map.component';


@NgModule({
    declarations: [
        SlickMapComponent
    ],
    imports: [
        CommonModule,
        AgmCoreModule
    ],
    exports: [
        AgmCoreModule,
        SlickMapComponent
    ]
})
export class SlickMapModule { }
