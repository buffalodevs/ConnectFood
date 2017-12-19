import { Component } from '@angular/core';
import { DialogService } from "ng2-bootstrap-modal";
import { Observable } from "rxjs/Observable";
import { Router, NavigationStart } from '@angular/router';

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

    public constructor (
        private router: Router,
        private dialogService: DialogService,
        private sessionDataService: SessionDataService,
        private logoutService: LogoutService,
        private bannerService: BannerService
    ) {   
        this.router.events.filter(event => (event instanceof NavigationStart))
            .subscribe((routeData: any) => {
                // Reset banner on each re-route!
                bannerService.setSrcImgUrl(null);
            });
    }


    private showLogin(): void {
        let dialogObserver: Observable<boolean> = LoginComponent.display(this.dialogService); 
        // Necessary so that observable action takes place!
        dialogObserver.subscribe(() => {});
    }


    private logout(): void {
        this.logoutService.logout();
    }


    private sessionDataAvailable(): boolean {
        return this.sessionDataService.sessionDataAvailable();
    }
}
