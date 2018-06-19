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
export declare class SimpleSpeechRecognition {
    button: HTMLInputElement;
    result: HTMLSpanElement;
    config: SimpleSpeechRecognitionConfiguration;
    recognition: any;
    running: boolean;
    /**
     * Initializes and build the component against the given configuration.
     * @param config the configuration object
     */
    build(config: SimpleSpeechRecognitionConfiguration): void;
    /**
     * Tells if the speech recognition is currently running.
     */
    isRunning(): boolean;
    /**
     * Toggles (starts or stops) the speech recognition.
     */
    toggle(): void;
    /**
     * Stops the speech recognition.
     */
    stop(): void;
    /**
     * Starts the speech recognition.
     */
    start(): void;
}
