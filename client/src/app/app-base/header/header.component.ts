import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from "rxjs/Observable";
import { Router, NavigationStart } from '@angular/router';
import 'rxjs/add/operator/filter';

import { BannerService } from '../../common-util/services/banner.service';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { LoginComponent } from '../../app-user/login/login.component';
import { LogoutService } from '../../app-user/logout/logout.service';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [LogoutService]
})
export class HeaderComponent {

    public isExpanded: boolean;
    

    public constructor (
        public router: Router,
        public bannerService: BannerService,
        public logoutService: LogoutService,
        public sessionDataService: SessionDataService,
        private _dialog: MatDialog
    ) {   
        router.events.filter(event => (event instanceof NavigationStart))
            .subscribe((routeData: any) => {
                // Reset banner on each re-route!
                bannerService.reset();
            });
    }


    public showLogin(): void {
        LoginComponent.display(this._dialog); 
    }
}
