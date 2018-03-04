declare class MotionController {
    private element;
    x: number;
    y: number;
    mouseDown: boolean;
    dragging: boolean;
    offsetX: number;
    offsetY: number;
    wrapper: HTMLElement;
    constructor(element: HTMLElement);
    private onMouseDown(evt);
    private onMouseClick(evt);
    private onMouseUp(evt);
    private onMouseMove(evt);
}
