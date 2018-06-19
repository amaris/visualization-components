var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
/**
 * A simple speech recognition component, which is a wrapper of the Web Speech Regognition API.
 */
export class SimpleSpeechRecognition {
    constructor() {
        this.running = false;
    }
    /**
     * Initializes and build the component against the given configuration.
     * @param config the configuration object
     */
    build(config) {
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
            this.button.addEventListener("click", () => this.toggle());
            let org = config.onSpeechRecognized;
            config.onSpeechRecognized = results => {
                this.result.innerHTML = results[0];
                org(results);
            };
        }
    }
    /**
     * Tells if the speech recognition is currently running.
     */
    isRunning() {
        return this.running;
    }
    /**
     * Toggles (starts or stops) the speech recognition.
     */
    toggle() {
        if (this.running) {
            this.stop();
        }
        else {
            this.start();
        }
    }
    /**
     * Stops the speech recognition.
     */
    stop() {
        if (this.running && this.config.onStop) {
            this.config.onStop();
        }
        this.running = false;
        if (this.recognition != null) {
            this.recognition.stop();
            this.recognition = undefined;
        }
    }
    /**
     * Starts the speech recognition.
     */
    start() {
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
        this.recognition.onresult = event => {
            let results = [];
            for (let i = 0; i < this.config.maxAlternatives; i++) {
                if (event.results[0][i]) {
                    results.push(event.results[0][i].transcript);
                }
            }
            this.config.onSpeechRecognized(results);
        };
        this.recognition.onspeechend = function () { };
        this.recognition.onerror = event => {
            if (this.config.onError) {
                this.config.onError(event.error);
            }
        };
        this.recognition.onaudiostart = function (event) { };
        this.recognition.onaudioend = function (event) { };
        this.recognition.onend = event => {
            if (this.running) {
                this.start();
            }
        };
        this.recognition.onnomatch = function (event) { };
        this.recognition.onsoundstart = function (event) { };
        this.recognition.onsoundend = function (event) { };
        this.recognition.onspeechstart = function (event) { };
        this.recognition.onstart = function (event) { };
    }
}
//# sourceMappingURL=speech-recognition.js.map