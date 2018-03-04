
class MotionController {

    x: number;
    y: number;
    mouseDown: boolean = false;
    dragging: boolean = false;
    offsetX: number=0;
    offsetY: number = 0;
    wrapper: HTMLElement;

    constructor(private element: HTMLElement) {
        this.wrapper = document.createElement("div");
        this.wrapper.style.overflow = "hidden";
        this.wrapper.style.height = element.parentElement.clientHeight + "px";
        element.parentElement.replaceChild(this.wrapper, element);
        this.wrapper.appendChild(element);
        this.wrapper.addEventListener("mousedown", evt => this.onMouseDown(evt));
        this.wrapper.addEventListener("mouseup", evt => this.onMouseUp(evt));
        this.wrapper.addEventListener("mousemove", evt => this.onMouseMove(evt));
        this.wrapper.addEventListener("click", evt => this.onMouseClick(evt));
        this.wrapper.style.width = "100%";
    }

    private onMouseDown(evt: MouseEvent) {
        if (evt.button == 0) {
            console.info("mouse down")
            this.x = evt.clientX;
            this.y = evt.clientY;
            this.mouseDown = true;
            this.dragging = false;
       }
    }

    private onMouseClick(evt: Event) {
        console.info("mouse click")
        if (this.dragging) {
            console.info("mouse click (dragging)");
                evt.stopPropagation();
            }
    }

    private onMouseUp(evt: MouseEvent) {
            console.info("mouse up")
            this.x = evt.clientX;
            this.y = evt.clientY;
            this.mouseDown = false;
    }

    private onMouseMove(evt: MouseEvent) {
        if (this.mouseDown) {
            let dx = this.x - evt.clientX;
            let dy = this.y - evt.clientY;
            this.offsetX -= dx;
            this.offsetY -= dy;
            console.info("dragging: " + this.offsetX + ", " + this.offsetY);
            this.element.style.transform = "translate(" + this.offsetX + "px ," + this.offsetY + "px)";
            this.x = evt.clientX;
            this.y = evt.clientY;
            this.dragging = true;
        }
    }

}
