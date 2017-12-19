import { Component } from '@angular/core';

@Component({
    selector: 'body',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {

    private readonly FOOTER_HEIGHT: number;
    private readonly BODY_HEIGHT: number;


    public constructor() {
        this.FOOTER_HEIGHT = 25;
        this.BODY_HEIGHT = window.innerHeight - this.FOOTER_HEIGHT;
    }
}
