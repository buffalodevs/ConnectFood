import { Directive, OnInit, OnDestroy, ElementRef, Input } from '@angular/core';
import { SlickStickyElement } from './slick-sticky-element';
import { SlickScrollableStickyConfig } from './slick-scrollable-sticky-config';
import { ObjectManipulation } from '../../../../../shared/common-util/object-manipulation';


@Directive({
    selector: '[SlickScrollableSticky]'
})
export class SlickScrollableStickyDirective implements OnInit, OnDestroy {

    
    /**
     * Configuration for the sticky behavior. See SlickScrollableStickyConfig definition for more details.
     */
    @Input('SlickScrollableSticky') private stickyConfig: SlickScrollableStickyConfig;
    /**
     * Determines if the sticky behavior (scrollable and non-scrollable) should be enabled.
     * Default is true. If set false, then the element will return to (and remain in) its original positioning style.
     */
    @Input() private enableSticky: boolean;

    private windowScrollEventListener: () => void;
    private stickyElement: SlickStickyElement;
    private lastViewportTopScrollPos: number;


    public constructor (
        private elementRef: ElementRef
    ) {
        this.stickyConfig = new SlickScrollableStickyConfig();
        this.enableSticky = true;
        this.windowScrollEventListener = this.listenForScroll.bind(this);
        this.lastViewportTopScrollPos = 0;
    }


    public ngOnInit(): void {

        this.sanitizeStickyConfigInput();
        
        const element: HTMLElement = this.elementRef.nativeElement;
        this.stickyElement = new SlickStickyElement(element, this.stickyConfig);
        window.addEventListener('scroll', this.windowScrollEventListener);
        this.listenForScroll(); // Trigger scroll listener to begin with since element can appear suddenly in sticky state.
    }


    public ngOnDestroy(): void {
        // Must remove scroll listener when we destroy the element!
        window.removeEventListener('scroll', this.windowScrollEventListener)
    }


    /**
     * Must make sure stickyConfig input value is valid by defaulting any emtpy fields or the entire value itself if not provided.
     */
    private sanitizeStickyConfigInput(): void {

        // If there was no sticky config input, then default initialize it.
        if (<any>this.stickyConfig === '') {
            this.stickyConfig = new SlickScrollableStickyConfig();
        }
        // Else there was an input, so fill in any missing values.
        else {

            const inputStickyConfig: SlickScrollableStickyConfig = this.stickyConfig;
            this.stickyConfig = new SlickScrollableStickyConfig();
            ObjectManipulation.shallowCopy(inputStickyConfig, this.stickyConfig);
        }
    }


    /**
     * Listens for scroll events and reacts to them by updating sticky element state.
     */
    private listenForScroll(): void {

        if (!this.checkIfStickyAllowed()) return; // Break out if sticky state is not allowed!

        // Calculate scroll (offset) position of viewport, and the amount just scrolled (positive if scrolled down, negative if scrolled up).
        const viewportTopScrollPos: number = this.getYScrollPosPx();
        const viewportBottomScrollPos: number = ( viewportTopScrollPos + this.getWindowClientHeight() );
        const scrollAmount: number = ( viewportTopScrollPos - this.lastViewportTopScrollPos );
        this.lastViewportTopScrollPos = viewportTopScrollPos;

        
        // NOTE: Must round... firefox does floating point which messes up comparisons.
        const elementTopPos: number = this.stickyElement.getTopPos(viewportTopScrollPos);
        const elementBottomPos: number = this.stickyElement.getBottomPos(viewportTopScrollPos);
        const didElementHitContainerBottom: boolean = this.didElementHitContainerBottom(elementBottomPos, viewportTopScrollPos, scrollAmount);
        

        if (!this.stickyElement.isPositionFixed()) {

            // If (when scrolling) we match top of element with top of viewport, and element fits inside viewport.
            if (this.shouldFixElementTop(elementTopPos, viewportTopScrollPos, scrollAmount, didElementHitContainerBottom)) {
                this.stickyElement.fixTop(viewportTopScrollPos); // Internally marks as sticky if not already.
            }
            // Else if (when scrolling) we match bottom of viewport with bottom of element, and element doesn't fit inside viewport.
            else if (this.shouldFixElementBottom(elementBottomPos, viewportBottomScrollPos, scrollAmount, didElementHitContainerBottom)) {
                this.stickyElement.fixBottom(viewportTopScrollPos); // Internally marks as sticky if not already.
            }
        }

        if (this.stickyElement.isPositionFixed()) {

            // If containerId specified in stickyConfig and we have hit the bottom of the contianer.
            if (didElementHitContainerBottom) {
                this.stickyElement.stickToContainerBottom(viewportTopScrollPos);
            }
            // If scrolling down with sticky top and bottom of element is not in view (element cannot fit in viewport).
            else if (( this.canElementScrollDown(elementBottomPos, viewportBottomScrollPos) && scrollAmount > 0 ) ||
                     // Or, if scrolling up with sticky bottom and top of sticky element is not in view (we can scroll its contents up).
                     ( this.canElementScrollUp(elementTopPos, viewportTopScrollPos) && scrollAmount < 0))
            {
                this.stickyElement.allowStickyScroll(viewportTopScrollPos);
            }
            else if (this.shouldRevertToUnsticky(elementTopPos, viewportTopScrollPos, scrollAmount)) {
                // Revert back to original state (and styles).
                this.stickyElement.markUnsticky();
            }
        }
    }


    /**
     * Makes sure that the sticky behavior is allowed: based on enableSticky input and if body's height is large enough (minBodyHeightRatio configuration).
     * NOTE: If it isn't, then any sticky state is removed internally.
     * @return true if the sticky state is allowed, false if not.
     */
    private checkIfStickyAllowed(): boolean {

        const canAllowSticky: boolean = ( this.enableSticky &&
                                          // Is our body height to element height ratio satisfied
                                          (this.stickyConfig.bodyToElementHeightRatio == null ||
                                           document.body.scrollHeight >= this.stickyElement.scrollHeight * this.stickyConfig.bodyToElementHeightRatio) );

        // If sticky is not allowed and our element is in sticky state, remove sticky state.
        if (!canAllowSticky && this.stickyElement.isSticky) {
            this.stickyElement.markUnsticky();
        }

        return canAllowSticky;
    }


    /**
     * Gets the Y position of the scroll (viewport top).
     */
    private getYScrollPosPx(): number {
        return ( window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0 );
    }


    /**
     * Gets the window client height. This height is the height of the viewport minus the height of any existing horizontal scrollbar.
     */
    private getWindowClientHeight(): number {
        return window.document.documentElement.clientHeight;
    }


    /**
     * Determines if we should set the elements position to fixed to the top of the viewport.
     * @param elementTopPos The top position of the element in the scrollable body.
     * @param viewportTopScrollPos The top position of the viewport in the scrollable body.
     * @param scrollAmount The amount that was just scrolled (px). A positive amount means scrolled down, and negative means scrolled up.
     * @param didElementHitContainerBottom Determines whether or not the element hit its container's bottom (meaning it shouldn't be able to move down farther).
     * @return true if it should, false if not.
     */
    private shouldFixElementTop(elementTopPos: number, viewportTopScrollPos: number, scrollAmount: number, didElementHitContainerBottom: boolean): boolean {

        // If the element top has been scrolled to/past (is above viewport) and the element can completely fit inside the viewport.
        const scrolledDownPast: boolean = ( viewportTopScrollPos >= elementTopPos && scrollAmount > 0
                                       && (!this.stickyConfig.scrollable || this.stickyElement.scrollHeight <= this.getWindowClientHeight()) );
        // If the element is sticky (in absolute pos scroll state), its contents are scrolling up, and we scroll past top, then it should be fixed to top.
        const scrolledUpPast: boolean = ( this.stickyElement.isSticky && scrollAmount < 0 && viewportTopScrollPos <= elementTopPos );

        return ( (scrolledDownPast && !didElementHitContainerBottom) || scrolledUpPast );
    }


    /**
     * Determines if we should set the elements position to fixed to the bottom of the viewport.
     * @param elementBottomPos The bottom position of the element in the scrollable body.
     * @param viewportBottomScrollPos The bottom position of the viewport in the scrollable body.
     * @param scrollAmount The amoutn that was just scrolled (px). A positive amount means scrolled down, and negative means scrolled up.
     * @param didElementHitContainerBottom Determines whether or not the element hit its container's bottom (meaning it shouldn't be able to move down farther).
     * @return true if it should, false if not.
     */
    private shouldFixElementBottom(elementBottomPos: number, viewportBottomScrollPos: number, scrollAmount: number, didElementHitContainerBottom: boolean): boolean {

        // If the element bottom has been scrolled to (is in viewport) and the element cannot completely fit inside the viewport.
        const scrolledDownPast: boolean = ( viewportBottomScrollPos >= elementBottomPos && this.stickyElement.scrollHeight > this.getWindowClientHeight() && scrollAmount > 0 );

        return ( this.stickyConfig.scrollable && scrolledDownPast && !didElementHitContainerBottom );
    }


    /**
     * Determines whether or not the sticky element expands beyond the top of the viewport and can be scrolled up.
     * @param elementTopPos The top position of the element in the scrollable body.
     * @param viewportTopScrollPos The top position of the viewport in the scrollable body.
     * @return true if it can, false if not.
     */
    private canElementScrollUp(elementTopPos: number, viewportTopScrollPos: number): boolean {
        return ( this.stickyConfig.scrollable && this.stickyElement.scrollHeight > this.getWindowClientHeight() && elementTopPos < viewportTopScrollPos );
    }


    /**
     * Determines whether or not the sticky element expands beyond the bottom of the viewport and can be scrolled down.
     * @param elementBottomPos The bottom position of the element in the scrollable body.
     * @param viewportBottomScrollPos The bottom position of the viewport in the scrollable body.
     * @return true if it can, false if not.
     */
    private canElementScrollDown(elementBottomPos: number, viewportBottomScrollPos: number): boolean {
        return ( this.stickyConfig.scrollable && this.stickyElement.scrollHeight > this.getWindowClientHeight() && elementBottomPos > viewportBottomScrollPos );
    }


    /**
     * Determines if the element should revert back to its original unsticky state (with original styles and position).
     * @param elementTopPos The top position of the element in the scrollable body.
     * @param viewportTopScrollPos The top position of the viewport in the scrollable body.
     * @param scrollAmount The amount that was scrolled in pixels (negative for up, positive for down).
     * @return true if the sticky element should revert back to an unsticky state, false if it should remain in sticky state.
     */
    private shouldRevertToUnsticky(elementTopPos: number, viewportTopScrollPos: number, scrollAmount: number): boolean {

        // If we don't have a container element set.
        if (this.stickyConfig.containerId == null) {
            // Did our sticky element move back up to its original top position before it entered into the sticky state
            return ( this.stickyElement.getOriginalTopPos() > elementTopPos || this.stickyElement.origTopPos >= viewportTopScrollPos );
        }
        // Else we do have a container element set.
        else {
            // Did our sticky element move to the top of its container element
            return this.didElementHitContainerTop(elementTopPos, viewportTopScrollPos, scrollAmount);
        }
    }


    /**
     * Determines whether or not the sticky element has moved all the way to the top of its specified container (in stickyConfig).
     * @param elementTopPos The top position of the element in the scrollable body.
     * @param viewportTopScrollPos The top position of the viewport in the scrollable body.
     * @param scrollAmount The amount that was scrolled in pixels (negative for up, positive for down).
     * @return true if the sticky element did hit the top of the container, false if not (or if no container specified).
     */
    private didElementHitContainerTop(elementTopPos: number, viewportTopScrollPos: number, scrollAmount: number): boolean {

        if (this.stickyConfig.containerId == null)  return false;

        // Get the container element from ID, check if it exists, and get its top position (relative to scrollable body top).
        const containerElement: HTMLElement = document.getElementById(this.stickyConfig.containerId);
        if (containerElement == null)   throw new Error('Container element does not exist with ID: ' + this.stickyConfig.containerId);
        const containerTopPos: number = ( viewportTopScrollPos + Math.ceil(containerElement.getBoundingClientRect().top) );

        return ( elementTopPos <= containerTopPos && scrollAmount < 0 );
    }


    /**
     * Determines whether or not the sticky element has moved all the way to the bottom of its specified container (in stickyConfig).
     * @param elementBottomPos The bottom position of the element in the scrollable body.
     * @param viewportTopScrollPos The top position of the viewport in the scrollable body.
     * @param scrollAmount The amount that was scrolled in pixels (negative for up, positive for down).
     * @return true if the sticky element did hit the bottom of the container, false if not (or if no container specified).
     */
    private didElementHitContainerBottom(elementBottomPos: number, viewportTopScrollPos: number, scrollAmount: number): boolean {

        if (this.stickyConfig.containerId == null)  return false;

        // Get the container element from ID, check if it exists, and get its bottom position (relative to scrollable body top).
        const containerElement: HTMLElement = document.getElementById(this.stickyConfig.containerId);
        if (containerElement == null)   throw new Error('Container element does not exist with ID: ' + this.stickyConfig.containerId);
        const containerBottomPos: number = ( viewportTopScrollPos + Math.floor(containerElement.getBoundingClientRect().bottom) );

        // NOTE: The containerBottomPos - 1 (emphasis on -1) is there due to IE's and Edge's calculation of getBoundingClientRect() (sometimes it can be a bit off).
        return ( elementBottomPos >= containerBottomPos - 1 && scrollAmount > 0 );
    }
}
