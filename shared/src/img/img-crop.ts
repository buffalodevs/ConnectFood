export class ImgCrop implements ClientRect {

    public constructor (
        public top: number = null,
        public right: number = null,
        public bottom: number = null,
        public left: number = null,
        public width: number = null,
        public height: number = null
    ) {}
}
