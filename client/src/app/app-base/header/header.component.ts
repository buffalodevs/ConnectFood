import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Observable } from "rxjs/Observable";
import { Router, NavigationStart } from '@angular/router';
import 'rxjs/add/operator/filter';

import { BannerService } from '../../common-util/services/banner.service';
import { SessionDataService } from '../../common-util/services/session-data.service';
import { LoginComponent } from '../../app-user/login/login.component';
import { LogoutService } from '../../app-user/logout/logout.service';
import { AppUserType } from '../../../../../shared/src/app-user/app-user';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    providers: [LogoutService]
})
export class HeaderComponent {

    public AppUserType = AppUserType;
    public isExpanded: boolean = false; // NOTE: Shouldn't set directly, but should use the toggleExpand, expand, and collapse methods below.
    

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
            sessionDataService.getAppUserSessionData()
    }


    public showLogin(): void {
        LoginComponent.display(this._dialog); 
    }


    public toggleExpand(navbarCollapse: HTMLDivElement): void {

        if (this.isExpanded) {
            this.collapse(navbarCollapse);
        }
        else {
            this.expand(navbarCollapse);
        }
    }


    public expand(navbarCollapse: HTMLDivElement): void {

        if (navbarCollapse) {
            navbarCollapse.classList.add('smooth-expand');
        }

        this.isExpanded = true;
    }

    public collapse(navbarCollapse: HTMLDivElement): void {

        if (navbarCollapse) {
            navbarCollapse.classList.remove('smooth-expand');
        }

        this.isExpanded = false;
    }
}
