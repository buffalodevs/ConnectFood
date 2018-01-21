import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';

import { SlickMapComponent } from './slick-map.component';
import { GeocodeService } from './geocode.service';


@NgModule({
    declarations: [
        SlickMapComponent
    ],
    imports: [
        CommonModule,
        AgmCoreModule
    ],
    exports: [
        SlickMapComponent
    ],
    providers: [
        GeocodeService
    ]
})
export class SlickMapModule {}
