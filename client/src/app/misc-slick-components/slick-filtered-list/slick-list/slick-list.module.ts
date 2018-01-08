import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatDialogModule } from '@angular/material';

import { CommonUtilModule } from '../../../common-util/common-util.module';
import { SlickListItemComponent } from './slick-list-item/slick-list-item.component';
import { GetListingsService } from './services/get-listings.service';
import { ConsumableListingCacheService } from './services/consumable-listing-cache.service';


@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        CommonUtilModule
    ],
    declarations: [
        SlickListItemComponent
    ],
    exports: [
        SlickListItemComponent
    ],
    providers: [
        GetListingsService,
        ConsumableListingCacheService
    ]
})
export class SlickListModule {}
