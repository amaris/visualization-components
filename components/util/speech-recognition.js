"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpeechRecognition = SpeechRecognition | webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent | webkitSpeechRecognitionEvent;
/**
 * A simple speech recognition component, which is a wrapper of the Web Speech Regognition API.
 */
var SimpleSpeechRecognition = /** @class */ (function () {
    function SimpleSpeechRecognition() {
        this.running = false;
    }
    /**
     * Initializes and build the component against the given configuration.
     * @param config the configuration object
     */
    SimpleSpeechRecognition.prototype.build = function (config) {
        var _this = this;
        this.config = config;
        if (!config.maxAlternatives) {
            config.maxAlternatives = 1;
        }
        if (config.container) {
            this.button = document.createElement("input");
            this.result = document.createElement("span");
            this.button.type = "checkbox";
            config.container.appendChild(this.button);
            config.container.appendChild(this.result);
            this.button.addEventListener("click", function () { return _this.toggle(); });
            var org_1 = config.onSpeechRecognized;
            config.onSpeechRecognized = function (results) {
                _this.result.innerHTML = results[0];
                org_1(results);
            };
        }
    };
    /**
     * Tells if the speech recognition is currently running.
     */
    SimpleSpeechRecognition.prototype.isRunning = function () {
        return this.running;
    };
    /**
     * Toggles (starts or stops) the speech recognition.
     */
    SimpleSpeechRecognition.prototype.toggle = function () {
        if (this.running) {
            this.stop();
        }
        else {
            this.start();
        }
    };
    /**
     * Stops the speech recognition.
     */
    SimpleSpeechRecognition.prototype.stop = function () {
        if (this.running && this.config.onStop) {
            this.config.onStop();
        }
        this.running = false;
        if (this.recognition != null) {
            this.recognition.stop();
            this.recognition = undefined;
        }
    };
    /**
     * Starts the speech recognition.
     */
    SimpleSpeechRecognition.prototype.start = function () {
        var _this = this;
        if (!this.running && this.config.onStart) {
            this.config.onStart();
        }
        this.running = true;
        if (this.recognition != null) {
            this.recognition.stop();
        }
        this.recognition = new SpeechRecognition();
        if (this.config.language) {
            this.recognition.lang = this.config.language;
        }
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = this.config.maxAlternatives;
        this.recognition.start();
        this.recognition.onresult = function (event) {
            var results = [];
            for (var i = 0; i < _this.config.maxAlternatives; i++) {
                if (event.results[0][i]) {
                    results.push(event.results[0][i].transcript);
                }
            }
            _this.config.onSpeechRecognized(results);
        };
        this.recognition.onspeechend = function () { };
        this.recognition.onerror = function (event) {
            if (_this.config.onError) {
                _this.config.onError(event.error);
            }
        };
        this.recognition.onaudiostart = function (event) { };
        this.recognition.onaudioend = function (event) { };
        this.recognition.onend = function (event) {
            if (_this.running) {
                _this.start();
            }
        };
        this.recognition.onnomatch = function (event) { };
        this.recognition.onsoundstart = function (event) { };
        this.recognition.onsoundend = function (event) { };
        this.recognition.onspeechstart = function (event) { };
        this.recognition.onstart = function (event) { };
    };
    return SimpleSpeechRecognition;
}());
exports.SimpleSpeechRecognition = SimpleSpeechRecognition;
//# sourceMappingURL=speech-recognition.js.map