/**
 * Configuration of slick scrollable sticky directive.
 */
export class SlickScrollableStickyConfig {

    public constructor (
        /**
         * Determines whether or not to allow sticky to be scrollable. Default is true.
         * 
         * A scrollable sticky will stick to the top like a basic sticky, and it will scroll internal content when the user scrolls the main viewport
         * if the sticky element extends beyond the height of the viewport.
         */
        public scrollable: boolean = true,
        /**
         * Set to true if the sticky element's parent should keep a minimum height to fit the sticky element inside of it even when the sticky element no longer
         * impacts the sizing of its parent due to changed position style.
         */
        public preserveHeightInParent: boolean = false,
        /**
         * A ratio of the body height over the sticky element height (e.g. 1.5 is provided, so body must be 1.5x height of element to activate sticky effects).
         */
        public bodyToElementHeightRatio?: number,
        /**
         * A name of a css class to apply to the sticky element when it enters sticky mode. It will also be removed when it exits sticky mode.
         */
        public stickyClass?: string,
        /**
         * The ID of a container element. If this is set, then the sticky element cannot move beyond the bottom of the container element.
         */
        public containerId?: string
    ) {}
}
