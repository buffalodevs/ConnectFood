import { Injectable } from '@angular/core';


@Injectable()
export class BannerService {

    private srcImgUrl: string;
    private heightPx: number;


    public constructor() {
        this.heightPx = 680;
    }


    public setSrcImgUrl(url: string): void {
        this.srcImgUrl = url;
    }


    public getSrcImgUrl(): string {
        return this.srcImgUrl;
    }


    public setHeightPx(heightPx: number): void {
        this.heightPx = heightPx;
    }


    public getHeightPx(): number {
        return this.heightPx;
    }
}
