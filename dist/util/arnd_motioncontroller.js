var MotionController = (function () {
    function MotionController(element) {
        var _this = this;
        this.element = element;
        this.mouseDown = false;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.wrapper = document.createElement("div");
        this.wrapper.style.overflow = "hidden";
        this.wrapper.style.height = element.parentElement.clientHeight + "px";
        element.parentElement.replaceChild(this.wrapper, element);
        this.wrapper.appendChild(element);
        this.wrapper.addEventListener("mousedown", function (evt) { return _this.onMouseDown(evt); });
        this.wrapper.addEventListener("mouseup", function (evt) { return _this.onMouseUp(evt); });
        this.wrapper.addEventListener("mousemove", function (evt) { return _this.onMouseMove(evt); });
        this.wrapper.addEventListener("click", function (evt) { return _this.onMouseClick(evt); });
        this.wrapper.style.width = "100%";
    }
    MotionController.prototype.onMouseDown = function (evt) {
        if (evt.button == 0) {
            console.info("mouse down");
            this.x = evt.clientX;
            this.y = evt.clientY;
            this.mouseDown = true;
            this.dragging = false;
        }
    };
    MotionController.prototype.onMouseClick = function (evt) {
        console.info("mouse click");
        if (this.dragging) {
            console.info("mouse click (dragging)");
            evt.stopPropagation();
        }
    };
    MotionController.prototype.onMouseUp = function (evt) {
        console.info("mouse up");
        this.x = evt.clientX;
        this.y = evt.clientY;
        this.mouseDown = false;
    };
    MotionController.prototype.onMouseMove = function (evt) {
        if (this.mouseDown) {
            var dx = this.x - evt.clientX;
            var dy = this.y - evt.clientY;
            this.offsetX -= dx;
            this.offsetY -= dy;
            console.info("dragging: " + this.offsetX + ", " + this.offsetY);
            this.element.style.transform = "translate(" + this.offsetX + "px ," + this.offsetY + "px)";
            this.x = evt.clientX;
            this.y = evt.clientY;
            this.dragging = true;
        }
    };
    return MotionController;
}());
//# sourceMappingURL=arnd_motioncontroller.js.map