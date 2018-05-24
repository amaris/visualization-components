

declare var webkitSpeechRecognition;
declare var webkitSpeechRecognitionEvent;

var SpeechRecognition = SpeechRecognition | webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent | webkitSpeechRecognitionEvent;

/**
 * The configuration object for the simple speech recognition component.
 */
export interface SimpleSpeechRecognitionConfiguration {
    /**
     * The optional container in which the controlling UI will be created (if not set, no UI is created).
     */
    container?: HTMLElement;
    /**
     * A field to force the language (if not set, default user language is used). Typical values: "en-US", "fr-FR", ...
     */
    language?: string;
    /**
     * The maximum number of alternative recognition results (default value is 1).
     */
    maxAlternatives?: number;
    /**
     * When some speech is recognizes, this function is upcalled with all the possible results as tuned with the maxAlternatives field.
     */
    onSpeechRecognized: (results: string[]) => void;
    /**
     * Upcalled when speech recognition started.
     */
    onStart?: () => void;
    /**
     * Upcalled when stopped.
     */
    onStop?: () => void;
    /**
     * Upcalled when an error occurs.
     */
    onError?: (errorMessage: string) => void;
}

/**
 * A simple speech recognition component, which is a wrapper of the Web Speech Regognition API.
 */
export class SimpleSpeechRecognition {

    button: HTMLInputElement;
    result: HTMLSpanElement;
    config: SimpleSpeechRecognitionConfiguration;
    recognition: any;
    running: boolean = false;

    /**
     * Initializes and build the component against the given configuration.
     * @param config the configuration object
     */
    public build(config: SimpleSpeechRecognitionConfiguration) {
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
            }
        }
    }

    /**
     * Tells if the speech recognition is currently running.
     */
    public isRunning(): boolean {
        return this.running;
    }

    /**
     * Toggles (starts or stops) the speech recognition.
     */
    public toggle() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    /**
     * Stops the speech recognition.
     */
    public stop() {
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
    public start() {
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
        }

        this.recognition.onspeechend = function () { }
        this.recognition.onerror = event => {
            if (this.config.onError) {
                this.config.onError(event.error);
            }
        }

        this.recognition.onaudiostart = function (event) { }
        this.recognition.onaudioend = function (event) { }
        this.recognition.onend = event => {
            if (this.running) {
                this.start();
            }
        }
        this.recognition.onnomatch = function (event) { }
        this.recognition.onsoundstart = function (event) { }
        this.recognition.onsoundend = function (event) { }
        this.recognition.onspeechstart = function (event) { }
        this.recognition.onstart = function (event) { }

    }

}
