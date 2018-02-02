import { Directive, OnInit, ElementRef } from '@angular/core';


@Directive({
    selector: '[AutoFocus]'
})
export class AutoFocusDirective implements OnInit {

    public constructor (
        private _elementRef: ElementRef
    ) {}

    public ngOnInit(): void {
        this._elementRef.nativeElement.focus();
    }
}
