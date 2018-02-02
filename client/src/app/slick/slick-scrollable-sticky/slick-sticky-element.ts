import { SlickScrollableStickyConfig } from "./slick-scrollable-sticky-config";


/**
 * Container for slick sticky element.
 */
export class SlickStickyElement {

    private _isStickyState: boolean;
    /**
     * When transitioning into fixed (sticky) position from original (unchanged) state, this will be the Y coordinate that will be used to determine
     * at what scroll position the element should return to its orignal state. Should be null if the elemnt is in its original state.
     * NOTE: Will not be used if a containerId is specified for a container element in the slick scrollable sticky config.
     */
    private _originalTopPos: number;
    private _originalStylePosition: string;
    private _originalStyleTop: string;
    private _originalStyleBottom: string;
    private _originalParentStyleMinHeight: string;


    public constructor (
        private _element: HTMLElement,
        private _stickyConfig: SlickScrollableStickyConfig
    ) {
        this._isStickyState = false;
        this._originalTopPos = null;
    }


    /**
     * Determines whether or not the sticky element is in a sticky state.
     * If the element is fixed to either side of the viewport or in sticky scroll mode, then it is in a sticky state.
     * @return true if the element is in a sticky state, false if not.
     */
    get isSticky(): boolean {
        return this._isStickyState;
    }


    /**
     * The original top position (relative to the top of the scrollable document body) of the element before it has entered the sticky state.
     * @return The original top position (px).
     */
    get origTopPos(): number {
        return this._originalTopPos;
    }


    /**
     * Marks the element as sticky when the element is first scrolled past.
     * @param viewportTopScrollPos The viewport top position relative to the top of the scrollable body.
     */
    public markSticky(viewportTopScrollPos: number): void {

        this._isStickyState = true;

        // Record original style data for sticky element so we can revert back when marking unsticky.
        this._originalStylePosition = this._element.style.position;
        this._originalStyleTop = this._element.style.top;
        this._originalStyleBottom = this._element.style.bottom;

        // Record position at which we will revert back to unsticky state if no container element specified (otherwise use container element clientTop).
        if (this._stickyConfig.containerId == null) {
            this._originalTopPos = this.getTopPos(viewportTopScrollPos);
        }
        
        // Add any specified sticky class.
        if (this._stickyConfig.stickyClass != null) {
            this._element.classList.add(this._stickyConfig.stickyClass);
        }

        // Make sure that the parent keeps enough room for sticky element (even when it is removed from parent's layout).
        if (this._stickyConfig.preserveHeightInParent) {
            this._originalParentStyleMinHeight = this._element.parentElement.style.minHeight;
            this._element.parentElement.style.minHeight = this._element.scrollHeight + 'px';
        }
    }


    /**
     * Fixes the sticky element to the top of the viewport. Also, marks the element as sticky if not already marked.
     * @param viewportTopScrollPos The top position of the viewport relative to the top of the scrollable body.
     */
    public fixTop(viewportTopScrollPos: number): void {
        
        if (!this.isSticky) this.markSticky(viewportTopScrollPos); // NOTE: Ok if already marked as sticky here!

        // Align fixed element to viewport top.
        this._element.style.position = 'fixed';
        this._element.style.top = '0px';
        this._element.style.bottom = 'auto';
    }


    /**
     * Fixes the sticky element to the bottom of the viewport. Also, marks the element as sticky if not already marked.
     * @param viewportTopScrollPos The top position of the viewport relative to the top of the scrollable body.
     */
    public fixBottom(viewportTopScrollPos: number): void {

        if (!this.isSticky) this.markSticky(viewportTopScrollPos); // NOTE: Ok if already marked as sticky here!

        // Align fixed element to viewport bottom.
        this._element.style.position = 'fixed';
        this._element.style.top = 'auto';
        this._element.style.bottom = '0px';
    }


    /**
     * Unfixes the sticky element from the viewport and allows it to scroll freely with the body without unsticking it from its current position in the body.
     * @param viewportTopScrollPos The top position of the viewport relative to the top of the scrollable body.
     */
    public allowStickyScroll(viewportTopScrollPos: number): void {

        // Calculate the offset from the top of the parent. We will place the element at this absolute position so it can be scrolled.
        const absoluteOffsetFromParentTop: number = this.calcOffsetFromParentTop(this.getTopPos(viewportTopScrollPos), viewportTopScrollPos);
        this.setElementAbsoluteYPos(absoluteOffsetFromParentTop);
    }


    /**
     * Takes a given position relative to the top of the scrollable document body and calculates what its absolute offset is fromt he top of this elements parent.
     * @param positionInBody The position in the scrollable body that should be converted to an offset from the top of this element's parent.
     * @return The absolute offset from the top of this element's parent.
     */
    private calcOffsetFromParentTop(positionInBody: number, viewportTopScrollPos): number {
        const parentElementTopPosition: number = ( viewportTopScrollPos + this._element.parentElement.parentElement.getBoundingClientRect().top );
        return ( positionInBody - parentElementTopPosition );
    }


    /**
     * Places the element at an absolute Y position.
     * @param absoluteYPos The absolute Y position to place the element at.
     */
    private setElementAbsoluteYPos(absoluteYPos): void {

        this._element.style.position = 'absolute';
        this._element.style.top = ( absoluteYPos + 'px' );
        this._element.style.bottom = 'auto';
    }


    /**
     * Sticks the sticky element bottom to the bottom of its specified container element (specified via containerId member of sticky configuration input).
     * @param viewportTopScrollPos The top position of the viewport relative to the top of the scrollable body.
     */
    public stickToContainerBottom(viewportTopScrollPos: number): void {

        // Get the container element from ID and check if it exists.
        const containerElement: HTMLElement = document.getElementById(this._stickyConfig.containerId);
        if (containerElement == null)   throw new Error('Container element does not exist with ID: ' + this._stickyConfig.containerId);

        // Calculate absolute top position for the sticky element based on container's height and sticky element's height.
        const stickyElementAbsoluteTopPos: number = ( containerElement.scrollHeight - this.scrollHeight );

        // Set sticky element to have absolute position that will cause it to stick to the bottom of the container element.
        this.setElementAbsoluteYPos(stickyElementAbsoluteTopPos);
    }


    /**
     * Marks this element as unsticky and returns it style back to the original.
     */
    public markUnsticky(): void {

        // Get rid of placeholder min-height for element in parent.
        if (this._stickyConfig.preserveHeightInParent) {
            this._element.parentElement.style.minHeight = this._originalParentStyleMinHeight;
        }

        // Remove any specified sticky class.
        if (this._stickyConfig.stickyClass != null) {
            this._element.classList.remove(this._stickyConfig.stickyClass);
        }

        // Return positioning styles back to original.
        this._element.style.position = this._originalStylePosition;
        this._element.style.top = this._originalStyleTop;
        this._element.style.bottom = this._originalStyleBottom;
        this._originalTopPos = null;

        this._isStickyState = false;
    }


    /**
     * Gets the original top position (relative to the top of the scrollable document body) before the element entered into sticky state.
     * @return The original top position (px).
     */
    public getOriginalTopPos(): number {
        return this._originalTopPos;
    }


    /**
     * Gets the top position of the sticky element (relative to the top of the scrollable body NOT the viewport).
     * @param viewportTopScrollPos The viewport top position relative to the top of the scrollable body.
     * @return The top position of the sticky element.
     */
    public getTopPos(viewportTopScrollPos: number): number {
        return ( Math.round(this._element.getBoundingClientRect().top) + viewportTopScrollPos );
    }


    /**
     * Gets the bottom position of the sticky element (relative to the top of the scrollable body NOT the viewport).
     * @param viewportTopScrollPos The viewport top position relative to the top of the scrollable body.
     * @return The bottom position of the sticky element.
     */
    public getBottomPos(viewportTopScrollPos: number): number {
        return ( Math.round(this._element.getBoundingClientRect().bottom) + viewportTopScrollPos );
    }


    /**
     * Gets the scroll height of the element (see original Javascript docs for details).
     * NOTE: This is the total height of the element (including portions outside of visible viewport).
     */
    get scrollHeight(): number {
        return this._element.scrollHeight;
    }


    /**
     * Checks if the sticky element position is fixed (to either top or bottom of viewport).
     * @return true if position is fixed, false if not.
     */
    public isPositionFixed(): boolean {
        return ( this._element.style.position === 'fixed' );
    }


    /**
     * Checks if the sticky element position is fixed to the top of the viewport.
     * @return true if position is fixed top, false if not.
     */
    public isPositionFixedTop(): boolean {
        return ( this._element.style.position === 'fixed' && this._element.style.top === '0px' );
    }


    /**
     * Checks if the sticky element position is fixed to the bottom of the viewport.
     * @return true if position is fixed bottom, false if not.
     */
    public isPositionFixedBottom(): boolean {
        return ( this._element.style.position === 'fixed' && this._element.style.bottom === '0px' );
    }
}
