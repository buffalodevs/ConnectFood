import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SlickScrollableStickyDirective } from './slick-scrollable-sticky.directive';


@NgModule({
    declarations: [
        SlickScrollableStickyDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SlickScrollableStickyDirective
    ]
})
export class SlickScrollableStickyModule {}
