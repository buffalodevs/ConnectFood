import { Component, OnInit } from '@angular/core';

import { BannerService } from '../../common-util/services/banner.service';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {


    public constructor(
        private bannerService: BannerService
    ) {}


    public ngOnInit(): void {
        this.bannerService.setSrcImgUrl('../assets/BannerImg.jpg');
    }
}
