import { Component } from '@angular/core';

@Component({
    selector: 'body',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    public readonly FOOTER_HEIGHT: number;
    public readonly BODY_MARGIN: number;
    public bodyHeight: number;


    public constructor() {
        this.FOOTER_HEIGHT = 25;
        this.BODY_MARGIN = 30;

        window.addEventListener('resize', this.recalcMinBodyHeight.bind(this));
        this.recalcMinBodyHeight();
    }


    private recalcMinBodyHeight(): void {
        this.bodyHeight = window.innerHeight - ( this.FOOTER_HEIGHT + this.BODY_MARGIN );
    }
}
