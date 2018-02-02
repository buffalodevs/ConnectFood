import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

import { RequestService } from "../../common-util/services/request.service";
import { SessionDataService } from '../../common-util/services/session-data.service';

@Injectable()
export class LogoutService {

    public constructor (
        private _router: Router,
        private _requestService: RequestService,
        private _sessionDataService: SessionDataService,
    ) {}

    public logout(): void {
        this._requestService.get('/appUser/logout').subscribe(() => {
            this._sessionDataService.clearSessionData();
            this._router.navigate(['/home']);
        });
        // Not interested in the response...
    }
}
