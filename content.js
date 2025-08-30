// Add message listener at the top level
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle ping message to verify content script is loaded
    if (message.action === 'ping') {
        sendResponse({ status: 'ok' });
        return true;
    }
    
    // Handle other messages
    if (message.action === 'startVoiceInput') {
        if (!window.formAssistant) {
            window.formAssistant = new FormAssistant();
        }
        if (message.voiceSettings) {
            window.formAssistant.setVoiceSettings(message.voiceSettings);
        }
        window.formAssistant.startListening(message.language);
        sendResponse({ status: 'started' });
    } else if (message.action === 'stopVoiceInput') {
        if (window.formAssistant) {
            window.formAssistant.stopListening();
        }
        sendResponse({ status: 'stopped' });
    } else if (message.action === 'updateLanguage') {
        if (window.formAssistant) {
            window.formAssistant.setLanguage(message.language);
        }
        sendResponse({ status: 'updated' });
    } else if (message.action === 'updateVoiceSettings') {
        if (window.formAssistant) {
            window.formAssistant.setVoiceSettings(message.voiceSettings);
        }
        sendResponse({ status: 'updated' });
    } else if (message.action === 'autoFocusForm') {
        // Handle auto-focus request
        if (!window.formAssistant) {
            window.formAssistant = new FormAssistant();
        }
        window.formAssistant.focusOnFirstFormField();
        sendResponse({ status: 'focused' });
    } else if (message.action === 'resetForm') {
        if (window.formAssistant) {
            window.formAssistant.resetForm();
        }
        sendResponse({ status: 'reset' });
    } else if (message.action === 'applyCachedData') {
        if (!window.formAssistant) {
            window.formAssistant = new FormAssistant();
        }
        const result = window.formAssistant.applyCachedData();
        sendResponse({ status: result ? 'applied' : 'not_applied' });
    } else if (message.action === 'clearCachedData') {
        if (window.formAssistant) {
            window.formAssistant.clearCachedData();
        }
        sendResponse({ status: 'cleared' });
    } else if (message.action === 'clearAllCachedData') {
        if (window.formAssistant) {
            window.formAssistant.clearAllCachedData();
        }
        sendResponse({ status: 'all_cleared' });
    } else if (message.action === 'setCacheEnabled') {
        if (window.formAssistant) {
            window.formAssistant.setCacheEnabled(message.enabled);
        }
        sendResponse({ status: 'updated' });
    } else if (message.action === 'toggleColorTheme') {
        if (window.formAssistant) {
            window.formAssistant.toggleColorTheme(message.isDarkMode);
        }
        sendResponse({ status: 'theme_updated' });
    }
    return true;
});

// Add CSS for UI consistency with light/dark mode support
const styleElement = document.createElement('style');
styleElement.textContent = `
    :root {
        --primary-color: #3344dc;
        --primary-color-hover: #2936b5;
        --text-color: #333333;
        --text-secondary-color: #555555;
        --background-color: #ffffff;
        --background-secondary: #f5f5f5;
        --border-color: #dddddd;
        --shadow-color: rgba(0, 0, 0, 0.2);
        --highlight-shadow: rgba(51, 68, 220, 0.5);
    }

    @media (prefers-color-scheme: dark) {
        :root {
            --primary-color: #3344dc;
            --primary-color-hover: #4455ed;
            --text-color: #e0e0e0;
            --text-secondary-color: #bbbbbb;
            --background-color: #222222;
            --background-secondary: #333333;
            --border-color: #444444;
            --shadow-color: rgba(0, 0, 0, 0.4);
            --highlight-shadow: rgba(51, 68, 220, 0.5);
        }
    }

    .voice-assistant-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: var(--primary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px var(--shadow-color);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        max-width: 350px;
        transition: all 0.3s ease;
        animation: fadeIn 0.3s;
    }

    .voice-input-highlight {
        outline: 2px solid var(--primary-color) !important;
        box-shadow: 0 0 8px var(--highlight-shadow) !important;
        transition: all 0.3s ease !important;
    }

    .voice-input-active {
        border-color: var(--primary-color) !important;
    }

    .voice-assistant-dialog {
        background-color: var(--background-color);
        border-radius: 8px;
        box-shadow: 0 4px 16px var(--shadow-color);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    .voice-assistant-dialog-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 15px 0;
        color: var(--text-color);
    }

    .voice-assistant-dialog-message {
        font-size: 14px;
        color: var(--text-secondary-color);
        margin-bottom: 20px;
    }

    .voice-assistant-dialog-buttons {
        display: flex;
        justify-content: flex-end;
    }

    .voice-assistant-button {
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .voice-assistant-button-primary {
        background-color: var(--primary-color);
        color: white;
        border: none;
    }

    .voice-assistant-button-primary:hover {
        background-color: var(--primary-color-hover);
    }

    .voice-assistant-button-secondary {
        background-color: var(--background-secondary);
        color: var(--text-color);
        border: 1px solid var(--border-color);
        margin-right: 10px;
    }

    .voice-assistant-button-secondary:hover {
        background-color: var(--border-color);
    }

    .voice-assistant-feedback {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: var(--primary-color);
        color: white;
        border-radius: 50%;
        width: 100px;
        height: 100px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
        font-size: 50px;
        box-shadow: 0 4px 12px var(--highlight-shadow);
    }

    /* Custom controls similar to the reference UI */
    .voice-assistant-control-panel {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: var(--background-color);
        color: var(--text-color);
        border-radius: 8px;
        box-shadow: 0 2px 10px var(--shadow-color);
        padding: 16px;
        max-width: 350px;
        margin: 0 auto;
        transition: all 0.3s ease;
    }

    .voice-assistant-control-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
    }

    .voice-assistant-logo {
        width: 40px;
        height: 40px;
        margin-right: 12px;
        border: 2px dashed var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--primary-color);
        font-weight: bold;
    }

    .voice-assistant-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--text-color);
        line-height: 1;
        margin: 0;
    }

    .voice-assistant-subtitle {
        font-size: 14px;
        color: var(--text-secondary-color);
        margin: 0;
    }

    .voice-assistant-toggle-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .voice-assistant-toggle-label {
        font-size: 14px;
        font-weight: 500;
    }

    .voice-assistant-toggle {
        position: relative;
        display: inline-block;
        width: 48px;
        height: 24px;
    }

    .voice-assistant-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .voice-assistant-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--background-secondary);
        transition: .3s;
        border-radius: 24px;
    }

    .voice-assistant-toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
    }

    .voice-assistant-toggle input:checked + .voice-assistant-toggle-slider {
        background-color: var(--primary-color);
    }

    .voice-assistant-toggle input:checked + .voice-assistant-toggle-slider:before {
        transform: translateX(24px);
    }

    .voice-assistant-section-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-color);
        margin: 16px 0 8px 0;
    }

    .voice-assistant-control-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
    }

    .voice-assistant-label {
        font-size: 14px;
    }

    .voice-assistant-input {
        background-color: var(--background-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 14px;
        color: var(--text-color);
        width: 120px;
    }

    .voice-assistant-select {
        background-color: var(--background-secondary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 6px 12px;
        font-size: 14px;
        color: var(--text-color);
        width: 120px;
        appearance: none;
        background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        background-size: 16px;
    }

    @media (prefers-color-scheme: dark) {
        .voice-assistant-select {
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23e0e0e0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
        }
    }

    .voice-assistant-color-picker {
        width: 30px;
        height: 30px;
        border: none;
        border-radius: 4px;
        background-color: var(--primary-color);
        cursor: pointer;
    }

    .voice-assistant-footer {
        font-size: 12px;
        color: var(--text-secondary-color);
        text-align: center;
        margin-top: 16px;
        padding-top: 8px;
        border-top: 1px solid var(--border-color);
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleElement);

class FormAssistant {
    constructor() {
        this.recognition = null;
        this.currentField = null;
        this.isListening = false;
        this.language = 'en';
        this.translationEndpoint = 'https://libretranslate.de/translate'; // Using LibreTranslate's public endpoint
        this.speechSynthesis = window.speechSynthesis;
        this.voiceType = 'default'; // Default voice type
        this.voiceSpeed = 1.0; // Default voice speed
        this.cache = {}; // Cache for form data
        this.cacheEnabled = true; // Whether caching is enabled
        this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.highlightColor = '#3344dc';
        this.highlightWeight = '2px';
        this.highlightStyle = 'solid'; // solid, dashed, dotted
        this.animatedHighlight = false;
        
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.filledFields = new Map(); // Store field values for review
        this.isReviewMode = false; // Track if we're in review mode
        this.isFieldCorrectionMode = false; // Track if we're correcting a field
        
        // Set up dark mode listener
        this.setupColorSchemeListener();
        
        // Load cache settings
        this.loadCacheSettings();
        
        // Load highlight settings
        this.loadHighlightSettings();
        
        // Focus on first form field when page is loaded
        if (document.readyState === 'complete') {
            this.focusOnFirstFormField();
        } else {
            window.addEventListener('load', () => this.focusOnFirstFormField());
        }
    }
    
    // Set up listener for system color scheme changes
    setupColorSchemeListener() {
        if (window.matchMedia) {
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            colorSchemeQuery.addEventListener('change', (e) => {
                this.isDarkMode = e.matches;
                this.updateColorTheme();
            });
        }
    }
    
    // Update the color theme based on system preference
    updateColorTheme() {
        // No need to do anything as we're using CSS variables with media queries
        console.log(`Color theme updated to ${this.isDarkMode ? 'dark' : 'light'} mode`);
    }
    
    // Manually toggle color theme
    toggleColorTheme(isDarkMode) {
        // Update local theme state
        this.isDarkMode = isDarkMode;
        
        // Apply theme to any UI elements created by the assistant
        const assistantElements = document.querySelectorAll('.voice-assistant-notification, .voice-assistant-dialog');
        assistantElements.forEach(el => {
            if (isDarkMode) {
                el.classList.add('dark-theme');
            } else {
                el.classList.remove('dark-theme');
            }
        });
        
        // Update highlight colors based on theme
        this.updateHighlightStyle();
    }
    
    saveHighlightSettings() {
        chrome.storage.sync.set({
            highlightSettings: {
                color: this.highlightColor,
                weight: this.highlightWeight,
                style: this.highlightStyle,
                animated: this.animatedHighlight
            }
        });
    }
    
    loadHighlightSettings() {
        chrome.storage.sync.get(['highlightSettings', 'darkMode'], (result) => {
            // Get dark mode preference
            if (result.darkMode !== undefined) {
                this.isDarkMode = result.darkMode;
            } else {
                // Default to system preference
                this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            }
            
            // Apply highlight settings if they exist
            if (result.highlightSettings) {
                const settings = result.highlightSettings;
                this.highlightColor = settings.color || this.highlightColor;
                this.highlightWeight = settings.weight || this.highlightWeight;
                this.highlightStyle = settings.style || this.highlightStyle;
                this.animatedHighlight = settings.animated !== undefined ? settings.animated : this.animatedHighlight;
            }
            
            this.updateHighlightStyle();
        });
    }
    
    updateHighlightStyle() {
        // Remove any existing style element
        const existingStyle = document.getElementById('voice-input-highlight-style');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Determine colors based on theme
        let highlightColor = this.highlightColor;
        let shadowColor = 'rgba(51, 68, 220, 0.5)';
        
        // Adjust colors for dark mode
        if (this.isDarkMode) {
            // Make highlight color more visible in dark mode
            highlightColor = this.highlightColor === '#3344dc' ? '#4455ed' : highlightColor;
            shadowColor = 'rgba(68, 85, 237, 0.5)';
        }
        
        // Convert hex color to RGB for shadow
        const rgbColor = this.hexToRgb(highlightColor);
        const rgbShadow = rgbColor ? `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0.5)` : shadowColor;
        
        // Create animation if enabled
        const animation = this.animatedHighlight ? 
            `@keyframes pulse-highlight {
                0% { box-shadow: 0 0 0 0 ${rgbShadow}; }
                70% { box-shadow: 0 0 0 8px rgba(0, 0, 0, 0); }
                100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
            }` : '';
        
        // Create the highlight style
        const highlightStyleElement = document.createElement('style');
        highlightStyleElement.id = 'voice-input-highlight-style';
        highlightStyleElement.textContent = `
            ${animation}
            .voice-input-highlight {
                outline: ${this.highlightWeight}px ${this.highlightStyle} ${highlightColor} !important;
                box-shadow: 0 0 8px ${rgbShadow} !important;
                transition: all 0.3s ease !important;
                ${this.animatedHighlight ? 'animation: pulse-highlight 2s infinite !important;' : ''}
            }
            .voice-input-active {
                border-color: ${highlightColor} !important;
            }
        `;
        document.head.appendChild(highlightStyleElement);
    }
    
    // Helper to convert hex to rgb for shadow
    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert 3-digit hex to 6-digits
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return { r, g, b };
    }
    
    // Set highlight color
    setHighlightColor(color) {
        this.highlightColor = color;
        this.updateHighlightStyle();
        this.saveHighlightSettings();
    }
    
    // Set highlight weight
    setHighlightWeight(weight) {
        this.highlightWeight = weight;
        this.updateHighlightStyle();
        this.saveHighlightSettings();
    }
    
    // Set highlight style
    setHighlightStyle(style) {
        this.highlightStyle = style;
        this.updateHighlightStyle();
        this.saveHighlightSettings();
    }
    
    // Toggle animated highlight
    setAnimatedHighlight(enabled) {
        this.animatedHighlight = enabled;
        this.updateHighlightStyle();
        this.saveHighlightSettings();
    }

    initializeSpeechRecognition() {
        // Check if speech recognition is available in this browser
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error("Speech recognition not supported in this browser");
            this.showNotification("Speech recognition not supported in this browser. Try using Chrome.");
            return;
        }

        // Use the appropriate speech recognition API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure the speech recognition
        this.recognition.continuous = true; // Changed to true for continuous listening
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.language;

        // Handle results
        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const transcript = result[0].transcript;
                console.log("Voice input received:", transcript);
                this.handleVoiceInput(transcript);
            }
        };

        // Handle errors
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            let errorMsg = 'Speech recognition error';
            
            // Provide more helpful error messages
            switch (event.error) {
                case 'no-speech':
                    errorMsg = 'No speech detected. Please try again.';
                    // Don't stop listening for no-speech error
                    if (this.isListening) {
                        this.restartRecognition();
                    }
                    return;
                case 'aborted':
                    errorMsg = 'Speech recognition was aborted.';
                    break;
                case 'audio-capture':
                    errorMsg = 'No microphone detected. Please check your device.';
                    break;
                case 'network':
                    errorMsg = 'Network error occurred. Please check your connection.';
                    break;
                case 'not-allowed':
                    errorMsg = 'Microphone access denied. Please allow access in your browser settings.';
                    break;
                case 'service-not-allowed':
                    errorMsg = 'Speech recognition service not allowed.';
                    break;
                case 'bad-grammar':
                    errorMsg = 'Grammar error in speech recognition.';
                    break;
                case 'language-not-supported':
                    errorMsg = `Language ${this.language} not supported for speech recognition.`;
                    break;
                default:
                    errorMsg = `Speech recognition error: ${event.error}`;
            }
            
            this.showNotification(errorMsg);
            this.stopListening();
        };

        // Handle recognition end
        this.recognition.onend = () => {
            console.log("Speech recognition ended");
            
            // If we're still in listening mode but recognition ended, restart it
            if (this.isListening) {
                this.restartRecognition();
            }
        };
        
        // Handle when recognition starts successfully
        this.recognition.onstart = () => {
            console.log("Speech recognition started successfully");
            this.isListening = true;
            this.showNotification("Voice input active. Speak now.");
        };
    }

    initializeSpeechSynthesis() {
        if ('speechSynthesis' in window) {
            this.synthesis = window.speechSynthesis;
            // Load available voices
            this.voices = window.speechSynthesis.getVoices();
            if (this.voices.length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    this.voices = window.speechSynthesis.getVoices();
                };
            }
        } else {
            console.error('Speech synthesis not supported');
        }
    }

    restartRecognition() {
        console.log("Attempting to restart speech recognition");
        setTimeout(() => {
            try {
                if (this.isListening && this.recognition) {
                    this.recognition.start();
                    console.log("Speech recognition restarted");
                }
            } catch (e) {
                console.error('Error restarting speech recognition:', e);
                this.isListening = false;
                this.showNotification('Failed to restart speech recognition. Please try again.');
            }
        }, 1000);
    }

    startListening() {
        if (!this.recognition) {
            this.initializeSpeechRecognition();
            
            if (!this.recognition) {
                this.showNotification("Speech recognition not available in this browser. Try using Chrome.");
                return;
            }
        }
        
        try {
            // First find a form field if we don't have one
            if (!this.currentField) {
                if (!this.findNextFormField()) {
                    this.showNotification("No form fields found on this page");
                    return;
                }
            }
            
            // Start listening
            this.recognition.start();
            this.isListening = true;
            console.log("Speech recognition started");
            
            // If not in field correction mode, announce the current field
            if (!this.isFieldCorrectionMode) {
            // Announce the first field
            const fieldLabel = this.getFieldLabel(this.currentField);
            this.speakText(`Please speak your input for ${fieldLabel}`);
            }
            
            // Highlight the current field
            this.highlightField(this.currentField);
        } catch (error) {
            console.error("Error starting speech recognition:", error);
            this.showNotification(`Could not start voice input: ${error.message}. Try reloading the page.`);
            this.isListening = false;
        }
    }

    stopListening() {
        if (this.recognition) {
            try {
                this.recognition.stop();
                console.log("Speech recognition stopped");
                this.showNotification("Voice input stopped");
            } catch (error) {
                console.error("Error stopping speech recognition:", error);
            }
            this.isListening = false;
        }
    }

    setLanguage(language) {
        this.language = language;
        if (this.recognition) {
            this.recognition.lang = language;
        }
        
        if (language !== 'en') {
            this.showNotification(`Translating page to ${this.getLanguageName(language)}...`);
            this.translatePage(language);
        }
    }

    getLanguageName(languageCode) {
        const languageNames = {
            'en': 'English',
            'hi': 'Hindi',
            'bn': 'Bengali',
            'ta': 'Tamil',
            'te': 'Telugu',
            'ml': 'Malayalam'
        };
        return languageNames[languageCode] || languageCode;
    }

    async translatePage(targetLanguage) {
        try {
            console.log(`Starting translation to ${targetLanguage}`);
            
            // Store original texts if not already stored
            if (!window._originalTexts) {
                window._originalTexts = new Map();
            }
            
            // Elements to translate (focusing on important text elements)
            const elements = document.querySelectorAll('label, button, h1, h2, h3, h4, p, th, td, a, span, div');
            let translatedCount = 0;
            
            // Show progress notification
            this.showNotification(`Translating page (0/${elements.length})...`);
            
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                const text = element.innerText || element.textContent;
                
                // Skip elements with no text, very short text, or inputs
                if (!text || text.trim().length < 2 || element.tagName === 'INPUT' || 
                    element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    continue;
                }
                
                // Skip elements with only numbers or special characters
                if (/^[0-9\s\.\,\:\;\-\+\=\(\)\[\]\{\}\<\>\/\\\|\!\@\#\$\%\^\&\*]*$/.test(text)) {
                    continue;
                }
                
                // Store original text if not already stored
                if (!window._originalTexts.has(element)) {
                    window._originalTexts.set(element, text);
                }
                
                try {
                    // Update progress every 10 elements
                    if (i % 10 === 0) {
                        this.showNotification(`Translating page (${i}/${elements.length})...`);
                    }
                    
                    const translatedText = await this.translateText(text, targetLanguage);
                    
                    if (translatedText && translatedText !== text) {
                        // For elements with simple text content
                        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
                            element.textContent = translatedText;
                        } 
                        // For elements with HTML inside, only translate the text portions
                        else {
                            this.translateTextNodes(element, targetLanguage);
                        }
                        translatedCount++;
                    }
                    
                    // Add small delay to avoid overwhelming the translation service
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (error) {
                    console.error('Error translating element:', error);
                    // Continue with other elements even if one fails
                }
            }
            
            // Also translate placeholders for input fields
            const inputElements = document.querySelectorAll('input[placeholder], textarea[placeholder]');
            for (const input of inputElements) {
                const placeholder = input.getAttribute('placeholder');
                if (placeholder && placeholder.trim().length > 1) {
                    try {
                        const translatedPlaceholder = await this.translateText(placeholder, targetLanguage);
                        if (translatedPlaceholder) {
                            input.setAttribute('placeholder', translatedPlaceholder);
                        }
                    } catch (error) {
                        console.error('Error translating placeholder:', error);
                    }
                }
            }
            
            this.showNotification(`Translation completed: ${translatedCount} elements translated to ${this.getLanguageName(targetLanguage)}`);
            console.log(`Translation completed: ${translatedCount} elements translated`);
            
        } catch (error) {
            console.error('Translation failed:', error);
            this.showNotification(`Translation failed: ${error.message}`);
        }
    }
    
    async translateTextNodes(element, targetLanguage) {
        // Recursively translate text nodes within an element
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
            const text = node.nodeValue.trim();
            if (text.length > 1) {
                try {
                    const translatedText = await this.translateText(text, targetLanguage);
                    if (translatedText) {
                        node.nodeValue = translatedText;
                    }
                } catch (error) {
                    console.error('Error translating text node:', error);
                }
            }
        }
    }

    async translateText(text, targetLanguage) {
        if (!text || text.trim() === '') return '';
        
        // For development/testing, you can return a simple modified text
        // return `[${targetLanguage}] ${text}`;
        
        try {
            // First try using Google Translate API
            const googleResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`);
            
            if (googleResponse.ok) {
                const data = await googleResponse.json();
                if (data && data[0] && data[0][0]) {
                    return data[0][0][0];
                }
            }
            
            // Fall back to LibreTranslate
            const response = await fetch(this.translationEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: 'auto',
                    target: targetLanguage,
                    format: 'text'
                })
            });

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data.translatedText || text;
        } catch (error) {
            console.error('Translation error:', error);
            // Fallback to original text if translation fails
            return text;
        }
    }

    findNextFormField() {
        const formFields = document.querySelectorAll('input, select, textarea');
        let currentIndex = -1;
        
        if (this.currentField) {
            this.currentField.classList.remove('voice-input-active');
            currentIndex = Array.from(formFields).indexOf(this.currentField);
        }

        const nextField = formFields[currentIndex + 1];
        if (nextField) {
            this.currentField = nextField;
            this.currentField.classList.add('voice-input-active');
            this.currentField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return true;
        }
        return false;
    }

    announceCurrentField() {
        if (this.currentField) {
            const label = this.findLabelForField(this.currentField);
            const fieldName = label ? label.textContent : this.currentField.name || 'field';
            this.speakText(fieldName);
            this.showNotification(`Now filling: ${fieldName}`);
        }
    }

    findLabelForField(field) {
        const label = field.labels?.[0];
        if (label) return label;

        const id = field.id;
        if (id) {
            return document.querySelector(`label[for="${id}"]`);
        }

        const parent = field.parentElement;
        if (parent) {
            return parent.querySelector('label');
        }

        return null;
    }

    speakText(text) {
        if (!this.synthesis) {
            console.error('Speech synthesis not initialized');
            return;
        }

        // Cancel any ongoing speech
        this.synthesis.cancel();

        // Create a new utterance for each speech
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice rate based on user preference
        utterance.rate = this.voiceSpeed;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.lang = this.language;
        
        // Set voice type if specified
        if (this.voiceType && this.voiceType !== 'default') {
            // Find the requested voice
            const voices = this.synthesis.getVoices();
            const voice = voices.find(v => v.name === this.voiceType);
            if (voice) {
                utterance.voice = voice;
            } else {
                console.log(`Requested voice "${this.voiceType}" not found, using default`);
            }
        }

        // Add event listener to know when speech is done
        return new Promise((resolve) => {
            utterance.onend = () => {
                resolve();
            };
            this.synthesis.speak(utterance);
        });
    }

    showNotification(message) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.voice-assistant-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create and show the notification
        const notification = document.createElement('div');
        notification.className = 'voice-assistant-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('fadeOut');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    async handleVoiceInput(transcript) {
        if (!this.currentField) {
            await this.speakText("No form field selected. Please select a field first.");
            return;
        }

        console.log('Processing voice input:', transcript);
        
        const fieldLabel = this.getFieldLabel(this.currentField);
        let processedValue = transcript.trim();
        
        // Check if this is a CAPTCHA field
        const isCaptcha = this.isCaptchaField(this.currentField);
        
        // Process special input formats for passwords, text fields, and CAPTCHA
        if (this.currentField.type === 'password' || 
            this.currentField.type === 'text' || 
            this.currentField.type === 'email' || 
            isCaptcha) {
            
            // For CAPTCHA, use letter-by-letter input without spaces
            if (isCaptcha) {
                processedValue = this.processLetterByLetter(processedValue);
            } else {
                processedValue = this.processSpecialCharacters(processedValue);
            }
        }
        
        // Set the field value
        if (this.currentField.type === 'checkbox' || this.currentField.type === 'radio') {
            const checkboxValue = this.processCheckboxInput(processedValue);
            if (!checkboxValue) return; // Invalid input was handled in processCheckboxInput
        } else if (this.currentField.tagName === 'SELECT') {
            const selectValue = this.processSelectInput(processedValue);
            if (!selectValue) return; // Invalid input was handled in processSelectInput
        } else {
            this.currentField.value = processedValue;
        }
        
        // Trigger input events
        this.currentField.dispatchEvent(new Event('input', { bubbles: true }));
        this.currentField.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Speak back what was entered, but handle password and CAPTCHA fields specially
        let confirmationMessage;
        if (this.currentField.type === 'password') {
            confirmationMessage = `You entered a password for ${fieldLabel}`;
        } else if (isCaptcha) {
            confirmationMessage = `You entered ${processedValue.split('').join(' ')} for the CAPTCHA`;
        } else if (this.currentField.type === 'checkbox' || this.currentField.type === 'radio') {
            confirmationMessage = `You ${this.currentField.checked ? 'checked' : 'unchecked'} the box for ${fieldLabel}`;
        } else if (this.currentField.tagName === 'SELECT') {
            const selectedOption = this.currentField.options[this.currentField.selectedIndex].text;
            confirmationMessage = `You selected ${selectedOption} for ${fieldLabel}`;
        } else {
            confirmationMessage = `You entered ${processedValue} for ${fieldLabel}`;
        }
        console.log('Speaking confirmation:', confirmationMessage);
        
        // Wait for the confirmation to be spoken
        await this.speakText(confirmationMessage);
        
        // If we're in field correction mode, go back to the form review
        if (this.isFieldCorrectionMode) {
            this.isFieldCorrectionMode = false;
            await this.startFormReview();
        } else {
            // Otherwise move to next field automatically
        await this.moveToNextField();
        }
    }

    async moveToNextField() {
        const formFields = this.getFormFields();
        const currentIndex = formFields.indexOf(this.currentField);
        
        // Store the current field value for review
        const fieldLabel = this.getFieldLabel(this.currentField);
        let fieldValue;
        
        if (this.currentField.type === 'checkbox' || this.currentField.type === 'radio') {
            fieldValue = this.currentField.checked ? 'checked' : 'unchecked';
        } else if (this.currentField.tagName === 'SELECT') {
            fieldValue = this.currentField.options[this.currentField.selectedIndex].text;
        } else {
            fieldValue = this.currentField.value;
        }
        
        this.filledFields.set(this.currentField, {
            label: fieldLabel,
            value: fieldValue
        });
        
        if (currentIndex < formFields.length - 1) {
            this.currentField = formFields[currentIndex + 1];
            const nextFieldLabel = this.getFieldLabel(this.currentField);
            this.highlightField(this.currentField);
            
            // Handle different field types specially
            if (this.currentField.type === 'checkbox' || this.currentField.type === 'radio') {
                await this.handleCheckboxField(nextFieldLabel);
            } else if (this.currentField.tagName === 'SELECT') {
                await this.handleSelectField(nextFieldLabel);
            } else {
                // Standard text input - just announce the field
            await this.speakText(`Please speak your input for ${nextFieldLabel}`);
            }
        } else {
            // We've reached the end of the form, start review mode
            await this.startFormReview();
        }
    }
    
    async handleCheckboxField(fieldLabel) {
        // Explicitly ask for yes/no for checkbox fields
        await this.speakText(`For ${fieldLabel}, please say 'yes' to check the box or 'no' to leave it unchecked.`);
    }
    
    async handleSelectField(fieldLabel) {
        // Read out all the available options before accepting input
        await this.speakText(`For ${fieldLabel}, you can choose from the following options:`);
        
        const options = this.currentField.options;
        let optionTexts = [];
        
        // Collect all option texts
        for (let i = 0; i < options.length; i++) {
            if (options[i].text && options[i].text.trim() !== '') {
                optionTexts.push(options[i].text.trim());
            }
        }
        
        // If there are too many options, just give a count
        if (optionTexts.length > 10) {
            await this.speakText(`There are ${optionTexts.length} options available. Please say the name of the option you want to select.`);
        } else {
            // Read each option with a short pause
            for (const optionText of optionTexts) {
                await this.speakText(optionText);
                await new Promise(resolve => setTimeout(resolve, 300)); // Short pause between options
            }
            
            await this.speakText("Please say the option you want to select.");
        }
    }
    
    async startFormReview() {
        this.isReviewMode = true;
        
        // First make sure any ongoing recognition is stopped
            this.stopListening();
        
        // Notify the user we're reviewing the form
        await this.speakText("You have reached the end of the form. Let me read back your entries for confirmation.");
        
        // Read back all the filled field values
        for (const [field, data] of this.filledFields.entries()) {
            await this.speakText(`For ${data.label}, you entered ${data.value}`);
            // Short pause between fields
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Ask for confirmation
        await this.listenForConfirmation();
    }
    
    async listenForConfirmation() {
        // Make sure normal recognition is stopped first
        this.stopListening();
        
        // Set up special recognition for confirmation
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const confirmationRecognition = new SpeechRecognition();
        
        confirmationRecognition.lang = this.language;
        confirmationRecognition.continuous = false;
        confirmationRecognition.maxAlternatives = 1;
        
        confirmationRecognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Confirmation response:", transcript);
            
            if (transcript.includes('yes') || transcript.includes('correct') || transcript.includes('submit')) {
                await this.speakText("Thank you. Submitting the form now.");
                this.submitForm();
            } else if (transcript.includes('no') || transcript.includes('wrong') || transcript.includes('incorrect')) {
                await this.speakText("Which field would you like to correct? Please say the name of the field.");
                this.listenForFieldCorrection();
            } else {
                await this.speakText("I didn't understand. Please say 'yes' to submit, or 'no' to make corrections.");
                // Try again
                setTimeout(() => this.listenForConfirmation(), 1000);
            }
        };
        
        confirmationRecognition.onerror = async (event) => {
            console.error("Error during confirmation:", event.error);
            await this.speakText("I had trouble understanding. Let's try again. Is the information correct?");
            setTimeout(() => this.listenForConfirmation(), 1000);
        };
        
        // Start listening
        try {
            confirmationRecognition.start();
        } catch (error) {
            console.error("Error starting confirmation recognition:", error);
            this.showNotification("Error with voice recognition. Please try again.");
        }
    }
    
    async listenForFieldCorrection() {
        this.isFieldCorrectionMode = true;
        
        // Make sure previous recognition is stopped
        if (this.recognition && this.isListening) {
            this.stopListening();
        }
        
        // Set up special recognition for field selection
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const fieldCorrectionRecognition = new SpeechRecognition();
        
        fieldCorrectionRecognition.lang = this.language;
        fieldCorrectionRecognition.continuous = false;
        fieldCorrectionRecognition.maxAlternatives = 1;
        
        fieldCorrectionRecognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Field correction response:", transcript);
            
            // Find the field that matches the spoken name
            const fieldToCorrect = this.findFieldByName(transcript);
            
            if (fieldToCorrect) {
                this.currentField = fieldToCorrect;
                this.highlightField(fieldToCorrect);
                
                const fieldLabel = this.getFieldLabel(fieldToCorrect);
                await this.speakText(`Please provide a new value for ${fieldLabel}`);
                
                // Start normal voice input for this field
                this.startListening();
            } else {
                await this.speakText("I couldn't find that field. Please say the name of the field again.");
                setTimeout(() => this.listenForFieldCorrection(), 1000);
            }
        };
        
        fieldCorrectionRecognition.onerror = async (event) => {
            console.error("Error during field correction:", event.error);
            await this.speakText("I had trouble understanding. Please say the name of the field you want to correct.");
            setTimeout(() => this.listenForFieldCorrection(), 1000);
        };
        
        // Start listening
        try {
            fieldCorrectionRecognition.start();
        } catch (error) {
            console.error("Error starting field correction recognition:", error);
            this.showNotification("Error with voice recognition. Please try again.");
        }
    }
    
    findFieldByName(spokenName) {
        spokenName = spokenName.toLowerCase();
        
        // Check each field we've filled
        for (const [field, data] of this.filledFields.entries()) {
            const fieldLabel = data.label.toLowerCase();
            
            // Check if the spoken name is part of the field label
            if (fieldLabel.includes(spokenName) || spokenName.includes(fieldLabel)) {
                return field;
            }
        }
        
        // If not found, try to find by checking all field labels
        const formFields = this.getFormFields();
        for (const field of formFields) {
            const fieldLabel = this.getFieldLabel(field).toLowerCase();
            if (fieldLabel.includes(spokenName) || spokenName.includes(fieldLabel)) {
                return field;
            }
        }
        
        return null;
    }
    
    submitForm() {
        // First try to directly click any visible submit button
        const submitButton = this.findSubmitButton();
        if (submitButton) {
            try {
                console.log("Found submit button, clicking it directly");
                submitButton.click();
                this.showNotification("Form submitted successfully!");
                
                // Notify background script about submission
                chrome.runtime.sendMessage({
                    action: 'formSubmitted',
                    url: window.location.href
                });
                
                // Reset state and return
                this.isReviewMode = false;
                this.filledFields.clear();
                this.stopListening();
                return;
            } catch (error) {
                console.error("Error clicking submit button:", error);
                // Continue to alternative submission methods
            }
        }
        
        // Find the form that contains our fields
        let form = null;
        
        // Try to find the form of the current field
        if (this.currentField && this.currentField.form) {
            form = this.currentField.form;
        }
        
        // If no form found, try to find a form with at least one of our fields
        if (!form) {
            for (const [field, _] of this.filledFields.entries()) {
                if (field.form) {
                    form = field.form;
                    break;
                }
            }
        }
        
        // If still no form, find the first form on the page
        if (!form) {
            const forms = document.querySelectorAll('form');
            if (forms.length > 0) {
                form = forms[0];
            }
        }
        
        if (form) {
            // Create and dispatch submit event
            try {
                // Try standard form submission first
                form.submit();
                this.showNotification("Form submitted successfully!");
                
                // Notify background script about submission
                chrome.runtime.sendMessage({
                    action: 'formSubmitted',
                    url: window.location.href
                });
                
            } catch (error) {
                console.error("Error submitting form:", error);
                
                // Fall back to creating a submit event
                try {
                    const submitEvent = new Event('submit', {
                        bubbles: true,
                        cancelable: true
                    });
                    
                    form.dispatchEvent(submitEvent);
                    this.showNotification("Form submitted successfully!");
                    
                    // Notify background script about submission
                    chrome.runtime.sendMessage({
                        action: 'formSubmitted',
                        url: window.location.href
                    });
                    
                } catch (innerError) {
                    console.error("Error dispatching submit event:", innerError);
                    this.showNotification("Could not submit the form automatically. Please submit it manually.");
                }
            }
        } else {
            console.error("No form found to submit");
            this.showNotification("Could not find a form to submit. Please submit it manually.");
        }
        
        // Before resetting state, cache the form data
        if (this.cacheEnabled) {
            this.saveCachedFormData();
        }
        
        // Reset state
        this.isReviewMode = false;
        this.filledFields.clear();
        this.stopListening();
    }
    
    findSubmitButton() {
        // Try multiple strategies to find the submit button
        
        // Special case for the "Sign In" button in the screenshot
        const signInButtonFromScreenshot = this.findElementByText('Sign In', ['button', 'input']);
        if (signInButtonFromScreenshot) {
            console.log("Found Sign In button from screenshot");
            return signInButtonFromScreenshot;
        }
        
        // 1. Look for conventional submit buttons
        const submitButtons = Array.from(document.querySelectorAll('button[type="submit"], input[type="submit"]'));
        if (submitButtons.length > 0) {
            return submitButtons[0]; // Return the first submit button
        }
        
        // 2. Look for buttons with submit-like text
        const submitTexts = ['submit', 'sign in', 'login', 'log in', 'sign up', 'register'];
        const buttons = Array.from(document.querySelectorAll('button, input[type="button"], a.button, .btn, [role="button"], [class*="button"], [class*="btn"]'));
        
        for (const button of buttons) {
            const buttonText = (button.textContent || button.value || '').toLowerCase().trim();
            for (const submitText of submitTexts) {
                if (buttonText.includes(submitText)) {
                    return button;
                }
            }
        }
        
        // 3. Look for button inside or right after a form
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
            const formButtons = form.querySelectorAll('button:not([type="button"]), input[type="button"], input[type="submit"]');
            if (formButtons.length > 0) {
                return formButtons[formButtons.length - 1]; // Last button in form is often submit
            }
            
            // Try to find a button right after the form
            let nextElement = form.nextElementSibling;
            while (nextElement && 
                  (nextElement.tagName === 'BUTTON' || 
                   nextElement.tagName === 'INPUT' || 
                   nextElement.classList.contains('button') || 
                   nextElement.classList.contains('btn'))) {
                return nextElement;
            }
        }
        
        // 4. Look for specific elements in the login form shown in the screenshot
        const specificSignInButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn, .button')).filter(button => {
            const buttonText = (button.textContent || button.value || '').toLowerCase().trim();
            return buttonText === 'sign in' || buttonText.includes('sign in');
        });
        
        if (specificSignInButtons.length > 0) {
            return specificSignInButtons[0];
        }
        
        // 5. Look for elements with special id/class names
        const buttonByIdClass = document.querySelector('#signIn, #login, #submit, #btnSubmit, .sign-in, .login, .submit');
        if (buttonByIdClass) {
            return buttonByIdClass;
        }
        
        // 6. If all else fails, look for the green button in the page from the screenshot
        const greenButtons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]')).filter(btn => {
            const style = window.getComputedStyle(btn);
            return style.backgroundColor.includes('green') || 
                   style.backgroundColor.includes('rgb(0, 128') || 
                   style.backgroundColor.includes('rgb(34, 197') || 
                   style.color === 'green';
        });
        
        if (greenButtons.length > 0) {
            return greenButtons[0];
        }
        
        return null; // No submit button found
    }
    
    findElementByText(text, tagNames = ['*']) {
        const normalizedText = text.toLowerCase().trim();
        
        for (const tagName of tagNames) {
            const elements = document.querySelectorAll(tagName);
            
            for (const element of elements) {
                // Check inner text content
                const elementText = (element.textContent || element.value || '').trim();
                if (elementText.toLowerCase() === normalizedText) {
                    return element;
                }
                
                // Check for buttons with inner spans or divs
                const innerElements = element.querySelectorAll('span, div');
                for (const innerElement of innerElements) {
                    const innerText = (innerElement.textContent || '').trim();
                    if (innerText.toLowerCase() === normalizedText) {
                        return element;
                    }
                }
                
                // Check value attribute for inputs
                if (element.tagName === 'INPUT' && element.value) {
                    if (element.value.toLowerCase().trim() === normalizedText) {
                        return element;
                    }
                }
            }
        }
        
        return null;
    }

    highlightField(field) {
        // Remove previous highlight
        const previousHighlight = document.querySelector('.voice-input-highlight');
        if (previousHighlight) {
            previousHighlight.classList.remove('voice-input-highlight');
        }
        
        // Add highlight to current field
        field.classList.add('voice-input-highlight');
        field.focus();
    }

    processSelectInput(transcript) {
        const options = this.currentField.options;
        
        // Check for exact matches first
        for (let i = 0; i < options.length; i++) {
            if (options[i].text.toLowerCase() === transcript.toLowerCase()) {
                this.currentField.selectedIndex = i;
                return options[i].text;
            }
        }
        
        // If no exact match, try partial matches
        for (let i = 0; i < options.length; i++) {
            if (options[i].text.toLowerCase().includes(transcript.toLowerCase()) ||
                transcript.toLowerCase().includes(options[i].text.toLowerCase())) {
                this.currentField.selectedIndex = i;
                return options[i].text;
            }
        }
        
        // If still no match found, check for option values
        for (let i = 0; i < options.length; i++) {
            if (options[i].value.toLowerCase() === transcript.toLowerCase() ||
                options[i].value.toLowerCase().includes(transcript.toLowerCase())) {
                this.currentField.selectedIndex = i;
                return options[i].text;
            }
        }
        
        // No match found - ask the user to try again
        this.speakText(`Could not find option matching "${transcript}". Please try again.`);
        
        // Read out options again for convenience
        setTimeout(() => {
            this.handleSelectField(this.getFieldLabel(this.currentField));
        }, 2000);
        
        return null;
    }

    processCheckboxInput(transcript) {
        const lowercaseInput = transcript.toLowerCase();
        if (['yes', 'true', 'check', 'checked', 'yeah', 'yep', 'ok', 'okay'].includes(lowercaseInput)) {
            this.currentField.checked = true;
            return 'checked';
        } else if (['no', 'false', 'uncheck', 'unchecked', 'nope', 'nah', 'negative'].includes(lowercaseInput)) {
            this.currentField.checked = false;
            return 'unchecked';
        }
        
        // Handle invalid input
        this.speakText("Please say 'yes' to check or 'no' to uncheck this box.");
        
        // Ask again
        setTimeout(() => {
            this.handleCheckboxField(this.getFieldLabel(this.currentField));
        }, 2000);
        
        return null;
    }

    getFieldLabel(field) {
        let label = '';
        
        // Try to get label from associated label element
        if (field.id) {
            const labelElement = document.querySelector(`label[for="${field.id}"]`);
            if (labelElement) {
                label = labelElement.textContent.trim();
            }
        }
        
        // Try parent label if no explicit label found
        if (!label && field.parentElement.tagName === 'LABEL') {
            label = field.parentElement.textContent.trim();
        }
        
        // Try aria-label
        if (!label && field.getAttribute('aria-label')) {
            label = field.getAttribute('aria-label');
        }
        
        // Try placeholder
        if (!label && field.placeholder) {
            label = field.placeholder;
        }
        
        // Try name attribute
        if (!label && field.name) {
            label = field.name.replace(/([A-Z])/g, ' $1')
                           .replace(/_/g, ' ')
                           .toLowerCase()
                           .trim();
        }
        
        return label || 'unnamed field';
    }

    getFormFields() {
        // Use our more focused form field getter
        return this.getMainFormFields();
    }

    // Focus exclusively on the first input field of the main form
    focusOnFirstFormField() {
        // Find all form fields but exclude navigation elements and buttons
        const formFields = this.getMainFormFields();
        
        if (formFields.length > 0) {
            // Focus on the first field
            this.currentField = formFields[0];
            this.currentField.focus();
            this.currentField.classList.add('voice-input-active');
            
            // Disable tab navigation to non-form elements
            this.enableFormOnlyNavigation();
            
            return true;
        }
        return false;
    }
    
    // Get only the fields from the main form, not navigation or other elements
    getMainFormFields() {
        const formFields = [];
        const inputs = document.querySelectorAll('input, select, textarea');
        
        // Form fields typically have a parent form element or are within the main content area
        inputs.forEach(input => {
            // Skip hidden fields, buttons, and navigation elements
            if (input.type !== 'hidden' && 
                input.type !== 'button' && 
                input.type !== 'submit' &&
                !this.isNavigationElement(input)) {
                formFields.push(input);
            }
        });
        
        // If we found form fields, return them
        if (formFields.length > 0) {
        return formFields;
        }
        
        // If no form fields were found, try a more focused approach
        // Look for forms with specific field labels like "Given Name" from the screenshot
        const givenNameField = Array.from(document.querySelectorAll('input')).find(input => {
            const label = this.getFieldLabel(input);
            return label.toLowerCase().includes('given name') || 
                   label.toLowerCase().includes('first name');
        });
        
        if (givenNameField) {
            return [givenNameField];
        }
        
        return formFields;
    }
    
    // Determine if an element is part of website navigation
    isNavigationElement(element) {
        // Check if the element is in a nav, header, or menu
        let parent = element.parentElement;
        while (parent) {
            if (parent.tagName === 'NAV' || 
                parent.tagName === 'HEADER' ||
                parent.id?.toLowerCase().includes('nav') ||
                parent.id?.toLowerCase().includes('menu') ||
                parent.className?.toLowerCase().includes('nav') ||
                parent.className?.toLowerCase().includes('menu')) {
                return true;
            }
            parent = parent.parentElement;
        }
        return false;
    }
    
    // Make only form fields tabbable
    enableFormOnlyNavigation() {
        // Set all non-form elements to tabindex -1
        document.querySelectorAll('a, button, [tabindex]').forEach(element => {
            // Skip if it's a form element or inside a form
            if (element.tagName === 'INPUT' || 
                element.tagName === 'SELECT' || 
                element.tagName === 'TEXTAREA' ||
                element.closest('form')) {
                return;
            }
            
            // Store original tabindex if it exists
            if (element.hasAttribute('tabindex')) {
                element.dataset.originalTabindex = element.getAttribute('tabindex');
            }
            
            // Make non-tabbable
            element.setAttribute('tabindex', '-1');
        });
    }
    
    // Restore normal tab navigation
    restoreNormalNavigation() {
        document.querySelectorAll('[data-original-tabindex]').forEach(element => {
            element.setAttribute('tabindex', element.dataset.originalTabindex);
            delete element.dataset.originalTabindex;
        });
        
        document.querySelectorAll('[tabindex="-1"]').forEach(element => {
            if (!(element.tagName === 'INPUT' || 
                 element.tagName === 'SELECT' || 
                 element.tagName === 'TEXTAREA' ||
                 element.closest('form'))) {
                element.removeAttribute('tabindex');
            }
        });
    }

    processSpecialCharacters(input) {
        // Split words for processing
        const words = input.split(' ');
        let result = '';
        let capitalizeNext = false;
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i].toLowerCase();
            
            // Check for capitalization commands
            if (word === 'capital' || word === 'uppercase' || word === 'cap') {
                capitalizeNext = true;
                continue;
            }
            
            // Handle single character commands
            if (word.length === 1) {
                // Apply capitalization if needed
                result += capitalizeNext ? word.toUpperCase() : word;
                capitalizeNext = false;
                continue;
            }
            
            // Handle special characters
            switch (word) {
                // Special characters
                case 'at':
                case 'at sign':
                    result += '@';
                    break;
                case 'hash':
                case 'pound':
                case 'hashtag':
                    result += '#';
                    break;
                case 'dollar':
                case 'dollars':
                    result += '$';
                    break;
                case 'percent':
                    result += '%';
                    break;
                case 'ampersand':
                case 'and sign':
                    result += '&';
                    break;
                case 'asterisk':
                case 'star':
                    result += '*';
                    break;
                case 'underscore':
                    result += '_';
                    break;
                case 'hyphen':
                case 'dash':
                case 'minus':
                    result += '-';
                    break;
                case 'plus':
                    result += '+';
                    break;
                case 'equals':
                case 'equal':
                case 'equal sign':
                    result += '=';
                    break;
                case 'dot':
                case 'period':
                case 'point':
                    result += '.';
                    break;
                case 'comma':
                    result += ',';
                    break;
                case 'exclamation':
                case 'exclamation point':
                case 'exclamation mark':
                    result += '!';
                    break;
                case 'question':
                case 'question mark':
                    result += '?';
                    break;
                case 'colon':
                    result += ':';
                    break;
                case 'semicolon':
                    result += ';';
                    break;
                case 'slash':
                case 'forward slash':
                    result += '/';
                    break;
                case 'backslash':
                    result += '\\';
                    break;
                case 'space':
                    result += ' ';
                    break;

                // Numbers
                case 'zero':
                    result += '0';
                    break;
                case 'one':
                    result += '1';
                    break;
                case 'two':
                    result += '2';
                    break;
                case 'three':
                    result += '3';
                    break;
                case 'four':
                    result += '4';
                    break;
                case 'five':
                    result += '5';
                    break;
                case 'six':
                    result += '6';
                    break;
                case 'seven':
                    result += '7';
                    break;
                case 'eight':
                    result += '8';
                    break;
                case 'nine':
                    result += '9';
                    break;
                
                // Default case for regular words
                default:
                    // Apply capitalization if needed
                    if (capitalizeNext && word.length > 0) {
                        result += word.charAt(0).toUpperCase() + word.slice(1);
                        capitalizeNext = false;
                    } else {
                        // Otherwise just add the word
                        result += word;
                    }
                    break;
            }
            
            // Add space between words, but not after special characters
            if (i < words.length - 1 && result.length > 0 && 
                !['@', '#', '$', '%', '&', '*', '_', '-', '+', '=', '.', ',', '!', '?', ':', ';', '/', '\\', ' '].includes(result.charAt(result.length - 1))) {
                result += ' ';
            }
        }
        
        return result;
    }

    isCaptchaField(field) {
        // Check different ways to identify a CAPTCHA field
        const fieldLabel = this.getFieldLabel(field).toLowerCase();
        
        // Check by label text
        if (fieldLabel.includes('captcha') || 
            fieldLabel.includes('security code') || 
            fieldLabel.includes('verification')) {
            return true;
        }
        
        // Check by nearby elements
        const nearbyElements = this.getNearbyElements(field, 3);
        for (const element of nearbyElements) {
            const text = element.textContent || '';
            if (text.toLowerCase().includes('captcha') || 
                text.toLowerCase().includes('verification') || 
                text.toLowerCase().includes('security code')) {
                return true;
            }
        }
        
        // Check for special CAPTCHA attributes
        if (field.id && (field.id.toLowerCase().includes('captcha') || 
                          field.id.toLowerCase().includes('security'))) {
            return true;
        }
        
        // Check if there's a CAPTCHA image nearby
        const parentElement = field.parentElement;
        if (parentElement) {
            const nearbyImg = parentElement.querySelector('img[alt*="captcha" i], img[alt*="verification" i]');
            if (nearbyImg) {
                return true;
            }
        }
        
        return false;
    }
    
    getNearbyElements(element, depth = 2) {
        const result = [];
        let parent = element.parentElement;
        
        // Go up the DOM tree
        for (let i = 0; i < depth && parent; i++) {
            // Add siblings of parents
            Array.from(parent.children).forEach(child => {
                if (child !== element && !result.includes(child)) {
                    result.push(child);
                }
            });
            parent = parent.parentElement;
        }
        
        return result;
    }
    
    processLetterByLetter(input) {
        // Process input letter by letter for CAPTCHA fields
        const words = input.toLowerCase().split(' ');
        let result = '';
        
        for (const word of words) {
            // If it's a single letter, add it directly
            if (word.length === 1) {
                result += word;
                continue;
            }
            
            // Handle spelled out letters
            switch (word) {
                case 'alpha':
                case 'a':
                    result += 'a';
                    break;
                case 'bravo':
                case 'b':
                    result += 'b';
                    break;
                case 'charlie':
                case 'c':
                    result += 'c';
                    break;
                case 'delta':
                case 'd':
                    result += 'd';
                    break;
                case 'echo':
                case 'e':
                    result += 'e';
                    break;
                case 'foxtrot':
                case 'f':
                    result += 'f';
                    break;
                case 'golf':
                case 'g':
                    result += 'g';
                    break;
                case 'hotel':
                case 'h':
                    result += 'h';
                    break;
                case 'india':
                case 'i':
                    result += 'i';
                    break;
                case 'juliet':
                case 'j':
                    result += 'j';
                    break;
                case 'kilo':
                case 'k':
                    result += 'k';
                    break;
                case 'lima':
                case 'l':
                    result += 'l';
                    break;
                case 'mike':
                case 'm':
                    result += 'm';
                    break;
                case 'november':
                case 'n':
                    result += 'n';
                    break;
                case 'oscar':
                case 'o':
                    result += 'o';
                    break;
                case 'papa':
                case 'p':
                    result += 'p';
                    break;
                case 'quebec':
                case 'q':
                    result += 'q';
                    break;
                case 'romeo':
                case 'r':
                    result += 'r';
                    break;
                case 'sierra':
                case 's':
                    result += 's';
                    break;
                case 'tango':
                case 't':
                    result += 't';
                    break;
                case 'uniform':
                case 'u':
                    result += 'u';
                    break;
                case 'victor':
                case 'v':
                    result += 'v';
                    break;
                case 'whiskey':
                case 'w':
                    result += 'w';
                    break;
                case 'x-ray':
                case 'x':
                    result += 'x';
                    break;
                case 'yankee':
                case 'y':
                    result += 'y';
                    break;
                case 'zulu':
                case 'z':
                    result += 'z';
                    break;
                // Handle capital letters
                case 'capital':
                case 'uppercase':
                case 'cap':
                    if (words.length > words.indexOf(word) + 1) {
                        const nextWord = words[words.indexOf(word) + 1];
                        if (nextWord.length === 1) {
                            result += nextWord.toUpperCase();
                            words.splice(words.indexOf(word) + 1, 1); // Remove the next word since we've processed it
                        }
                    }
                    break;
                default:
                    // For short words that might be part of the CAPTCHA, add them directly
                    if (word.length <= 3) {
                        result += word;
                    }
                    break;
            }
        }
        
        return result;
    }

    resetForm() {
        // Removed confirmation dialog for direct reset
        let formReset = false;
        
        // Find the form that contains our fields
        let form = null;
        
        // Try to find the form of the current field
        if (this.currentField && this.currentField.form) {
            form = this.currentField.form;
        }
        
        // If no form found, try to find a form with at least one of our fields
        if (!form) {
            for (const [field, _] of this.filledFields.entries()) {
                if (field.form) {
                    form = field.form;
                    break;
                }
            }
        }
        
        // If still no form, find the first form on the page
        if (!form) {
            const forms = document.querySelectorAll('form');
            if (forms.length > 0) {
                form = forms[0];
            }
        }
        
        // Save the first field for later focus
        const formFields = this.getFormFields();
        const firstField = formFields.length > 0 ? formFields[0] : null;
        
        if (form) {
            // Try native form reset
            try {
                form.reset();
                formReset = true;
            } catch (error) {
                console.error("Error resetting form:", error);
                // Fall back to manual reset
            }
        }
        
        // If the native reset didn't work or we couldn't find a form, try manual reset of known fields
        if (!formReset) {
            formFields.forEach(field => {
                if (field.tagName === 'INPUT') {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = false;
                    } else if (field.type !== 'submit' && field.type !== 'button') {
                        field.value = '';
                    }
                } else if (field.tagName === 'SELECT') {
                    field.selectedIndex = 0;
                } else if (field.tagName === 'TEXTAREA') {
                    field.value = '';
                }
                
                // Trigger input and change events
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Reset validation states
                field.classList.remove('invalid', 'error', 'field-error', 'is-invalid');
                field.classList.remove('valid', 'success', 'field-valid', 'is-valid');
                
                // Remove any aria-invalid attributes
                field.removeAttribute('aria-invalid');
                
                // Clear any custom validation messages
                field.setCustomValidity('');
            });
            
            formReset = true;
        }
        
        // Reset any error messages displayed on the page
        this.clearErrorMessages();
        
        // Reset our tracking state
        this.filledFields.clear();
        this.isReviewMode = false;
        
        // Provide enhanced visual feedback
        this.showResetFeedback();
        
        // Provide user feedback
        if (formReset) {
            this.showNotification("Form has been reset");
            this.speakText("Form has been reset, all fields are now empty");
            
            // Focus on the first field
            if (firstField) {
                setTimeout(() => {
                    firstField.focus();
                    this.currentField = firstField;
                    this.highlightField(firstField);
                }, 500);
            }
        } else {
            this.showNotification("Could not reset the form");
            this.speakText("Sorry, I could not reset the form");
        }
        
        return formReset;
    }
    
    showConfirmationDialog(title, message) {
        // Create a modal overlay for confirmation
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '9999';
        
        // Create the dialog box
        const dialog = document.createElement('div');
        dialog.className = 'voice-assistant-dialog';
        dialog.style.padding = '20px';
        dialog.style.maxWidth = '400px';
        
        // Add title
        const titleElem = document.createElement('h3');
        titleElem.className = 'voice-assistant-dialog-title';
        titleElem.textContent = title;
        
        // Add message
        const messageElem = document.createElement('p');
        messageElem.className = 'voice-assistant-dialog-message';
        messageElem.textContent = message;
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'voice-assistant-dialog-buttons';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'voice-assistant-button voice-assistant-button-secondary';
        cancelButton.textContent = 'Cancel';
        
        const confirmButton = document.createElement('button');
        confirmButton.className = 'voice-assistant-button voice-assistant-button-primary';
        confirmButton.textContent = 'Reset Form';
        
        // Append elements
        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(confirmButton);
        
        dialog.appendChild(titleElem);
        dialog.appendChild(messageElem);
        dialog.appendChild(buttonContainer);
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Handle confirmation
        return new Promise(resolve => {
            confirmButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(true);
            });
            
            cancelButton.addEventListener('click', () => {
                document.body.removeChild(overlay);
                resolve(false);
            });
        });
    }
    
    clearErrorMessages() {
        // Common error message selectors
        const errorSelectors = [
            '.error-message',
            '.form-error',
            '.validation-message',
            '.help-block',
            '.invalid-feedback',
            '.field-error-message',
            '[role="alert"]'
        ];
        
        // Find and clear error messages
        errorSelectors.forEach(selector => {
            const errorElements = document.querySelectorAll(selector);
            errorElements.forEach(element => {
                // Either hide or clear the content
                if (element.style.display) {
                    element.style.display = 'none';
                } else {
                    element.textContent = '';
                }
            });
        });
    }
    
    showResetFeedback() {
        // Create a visual feedback element
        const feedback = document.createElement('div');
        feedback.className = 'voice-assistant-feedback';
        
        // Add a checkmark icon
        const icon = document.createElement('div');
        icon.innerHTML = '✓';
        
        feedback.appendChild(icon);
        document.body.appendChild(feedback);
        
        // Animate
        setTimeout(() => {
            feedback.style.opacity = '1';
        }, 10);
        
        setTimeout(() => {
            feedback.style.opacity = '0';
        }, 1500);
        
        setTimeout(() => {
            document.body.removeChild(feedback);
        }, 1800);
    }

    setVoiceSettings(settings) {
        if (settings.voiceType) {
            this.voiceType = settings.voiceType;
        }
        if (settings.voiceSpeed !== undefined) {
            this.voiceSpeed = settings.voiceSpeed;
        }
        console.log('Voice settings updated:', this.voiceType, this.voiceSpeed);
    }

    // Load cache settings from storage
    loadCacheSettings() {
        chrome.storage.sync.get(['cacheEnabled'], (result) => {
            if (result.hasOwnProperty('cacheEnabled')) {
                this.cacheEnabled = result.cacheEnabled;
            }
            
            // Load cached form data for this domain
            if (this.cacheEnabled) {
                this.loadCachedFormData();
            }
        });
    }
    
    // Save cache settings to storage
    saveCacheSettings() {
        chrome.storage.sync.set({ cacheEnabled: this.cacheEnabled });
    }
    
    // Toggle cache functionality
    setCacheEnabled(enabled) {
        this.cacheEnabled = enabled;
        this.saveCacheSettings();
        
        if (enabled) {
            this.showNotification("Form caching enabled");
        } else {
            this.showNotification("Form caching disabled");
        }
    }
    
    // Get cache key for the current page
    getCacheKey() {
        // Use domain and page path as the cache key
        const url = new URL(window.location.href);
        return `${url.hostname}${url.pathname}`;
    }
    
    // Save form data to cache
    saveCachedFormData() {
        if (!this.cacheEnabled) return;
        
        const cacheKey = this.getCacheKey();
        const formData = {};
        
        // Extract data from filled fields
        for (const [field, data] of this.filledFields.entries()) {
            // Create a unique identifier for this field based on its properties
            const fieldId = this.getFieldIdentifier(field);
            if (fieldId) {
                formData[fieldId] = {
                    label: data.label,
                    value: data.value,
                    type: field.type || field.tagName.toLowerCase()
                };
            }
        }
        
        // Store in Chrome storage
        if (Object.keys(formData).length > 0) {
            const storageData = {};
            storageData[`formCache_${cacheKey}`] = formData;
            chrome.storage.local.set(storageData, () => {
                console.log('Form data cached for:', cacheKey);
            });
            
            // Also update in-memory cache
            this.cache[cacheKey] = formData;
        }
    }
    
    // Load cached form data
    loadCachedFormData() {
        const cacheKey = this.getCacheKey();
        
        chrome.storage.local.get([`formCache_${cacheKey}`], (result) => {
            const cachedData = result[`formCache_${cacheKey}`];
            if (cachedData) {
                console.log('Loaded cached form data for:', cacheKey);
                this.cache[cacheKey] = cachedData;
            }
        });
    }
    
    // Get a unique identifier for a form field
    getFieldIdentifier(field) {
        // Try to create a reliable identifier using available attributes
        const identifiers = [];
        
        if (field.id) identifiers.push(`id:${field.id}`);
        if (field.name) identifiers.push(`name:${field.name}`);
        if (field.placeholder) identifiers.push(`placeholder:${field.placeholder}`);
        
        // If no standard identifiers, use the label
        if (identifiers.length === 0) {
            const label = this.getFieldLabel(field);
            if (label && label !== 'unnamed field') {
                identifiers.push(`label:${label}`);
            }
        }
        
        // Add type information
        identifiers.push(`type:${field.type || field.tagName.toLowerCase()}`);
        
        return identifiers.join('|');
    }
    
    // Apply cached data to a form
    applyCachedData() {
        if (!this.cacheEnabled) return false;
        
        const cacheKey = this.getCacheKey();
        const cachedData = this.cache[cacheKey];
        
        if (!cachedData) {
            this.showNotification("No cached data found for this form");
            return false;
        }
        
        // Get all form fields
        const formFields = this.getFormFields();
        let appliedCount = 0;
        
        // Try to match fields and apply cached values
        for (const field of formFields) {
            const fieldId = this.getFieldIdentifier(field);
            
            if (fieldId && cachedData[fieldId]) {
                const data = cachedData[fieldId];
                
                // Apply the cached value based on field type
                if (field.tagName === 'INPUT') {
                    if (field.type === 'checkbox' || field.type === 'radio') {
                        field.checked = data.value === 'checked';
                    } else if (field.type !== 'submit' && field.type !== 'button') {
                        field.value = data.value;
                    }
                } else if (field.tagName === 'SELECT') {
                    // Try to find the option with matching text
                    for (let i = 0; i < field.options.length; i++) {
                        if (field.options[i].text === data.value) {
                            field.selectedIndex = i;
                            break;
                        }
                    }
                } else if (field.tagName === 'TEXTAREA') {
                    field.value = data.value;
                }
                
                // Trigger input and change events
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Add to filledFields for tracking
                this.filledFields.set(field, {
                    label: data.label,
                    value: data.value
                });
                
                appliedCount++;
            }
        }
        
        if (appliedCount > 0) {
            this.showNotification(`Applied ${appliedCount} values from cache`);
            return true;
        } else {
            this.showNotification("No matching fields found in cache");
            return false;
        }
    }
    
    // Clear cached data for current form
    clearCachedData() {
        const cacheKey = this.getCacheKey();
        
        chrome.storage.local.remove([`formCache_${cacheKey}`], () => {
            delete this.cache[cacheKey];
            this.showNotification("Cache cleared for this form");
        });
    }
    
    // Clear all cached form data
    clearAllCachedData() {
        chrome.storage.local.get(null, (items) => {
            const cacheKeys = Object.keys(items).filter(key => key.startsWith('formCache_'));
            
            if (cacheKeys.length > 0) {
                chrome.storage.local.remove(cacheKeys, () => {
                    this.cache = {};
                    this.showNotification("All form caches cleared");
                });
            } else {
                this.showNotification("No cached data to clear");
            }
        });
    }

    // Create a control panel UI
    createControlPanel() {
        // Remove existing panel if any
        const existingPanel = document.querySelector('.voice-assistant-control-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // Create the main container
        const panel = document.createElement('div');
        panel.className = 'voice-assistant-control-panel';
        
        // Create header with logo and title
        const header = document.createElement('div');
        header.className = 'voice-assistant-control-header';
        
        const logo = document.createElement('div');
        logo.className = 'voice-assistant-logo';
        logo.textContent = 'æ';
        
        const titleContainer = document.createElement('div');
        
        const title = document.createElement('h2');
        title.className = 'voice-assistant-title';
        title.textContent = 'Active';
        
        const subtitle = document.createElement('p');
        subtitle.className = 'voice-assistant-subtitle';
        subtitle.textContent = 'Elements';
        
        titleContainer.appendChild(title);
        titleContainer.appendChild(subtitle);
        
        header.appendChild(logo);
        header.appendChild(titleContainer);
        
        // Create enable/disable toggle
        const enableRow = document.createElement('div');
        enableRow.className = 'voice-assistant-toggle-row';
        
        const enableLabel = document.createElement('span');
        enableLabel.className = 'voice-assistant-toggle-label';
        enableLabel.textContent = 'Enable extension';
        
        const enableToggle = document.createElement('label');
        enableToggle.className = 'voice-assistant-toggle';
        
        const enableInput = document.createElement('input');
        enableInput.type = 'checkbox';
        enableInput.checked = true;
        
        const enableSlider = document.createElement('span');
        enableSlider.className = 'voice-assistant-toggle-slider';
        
        enableToggle.appendChild(enableInput);
        enableToggle.appendChild(enableSlider);
        
        enableRow.appendChild(enableLabel);
        enableRow.appendChild(enableToggle);
        
        // Create customize section
        const customizeTitle = document.createElement('div');
        customizeTitle.className = 'voice-assistant-section-title';
        customizeTitle.textContent = 'Customize focus';
        
        // Border weight
        const weightRow = document.createElement('div');
        weightRow.className = 'voice-assistant-control-row';
        
        const weightLabel = document.createElement('label');
        weightLabel.className = 'voice-assistant-label';
        weightLabel.textContent = 'Border weight';
        
        const weightInput = document.createElement('input');
        weightInput.className = 'voice-assistant-input';
        weightInput.type = 'text';
        weightInput.value = this.highlightWeight;
        
        weightRow.appendChild(weightLabel);
        weightRow.appendChild(weightInput);
        
        // Color
        const colorRow = document.createElement('div');
        colorRow.className = 'voice-assistant-control-row';
        
        const colorLabel = document.createElement('label');
        colorLabel.className = 'voice-assistant-label';
        colorLabel.textContent = 'Color';
        
        const colorContainer = document.createElement('div');
        colorContainer.style.display = 'flex';
        colorContainer.style.alignItems = 'center';
        
        const colorPicker = document.createElement('input');
        colorPicker.className = 'voice-assistant-color-picker';
        colorPicker.type = 'color';
        colorPicker.value = this.highlightColor;
        
        const colorText = document.createElement('input');
        colorText.className = 'voice-assistant-input';
        colorText.type = 'text';
        colorText.value = this.highlightColor;
        colorText.style.marginLeft = '8px';
        colorText.style.width = '80px';
        
        colorContainer.appendChild(colorPicker);
        colorContainer.appendChild(colorText);
        
        colorRow.appendChild(colorLabel);
        colorRow.appendChild(colorContainer);
        
        // Line style
        const styleRow = document.createElement('div');
        styleRow.className = 'voice-assistant-control-row';
        
        const styleLabel = document.createElement('label');
        styleLabel.className = 'voice-assistant-label';
        styleLabel.textContent = 'Line style';
        
        const styleSelect = document.createElement('select');
        styleSelect.className = 'voice-assistant-select';
        
        const solidOption = document.createElement('option');
        solidOption.value = 'solid';
        solidOption.textContent = 'Solid';
        
        const dashedOption = document.createElement('option');
        dashedOption.value = 'dashed';
        dashedOption.textContent = 'Dashed';
        
        const dottedOption = document.createElement('option');
        dottedOption.value = 'dotted';
        dottedOption.textContent = 'Dotted';
        
        styleSelect.appendChild(solidOption);
        styleSelect.appendChild(dashedOption);
        styleSelect.appendChild(dottedOption);
        
        // Set the current value
        styleSelect.value = this.highlightStyle;
        
        styleRow.appendChild(styleLabel);
        styleRow.appendChild(styleSelect);
        
        // Animate border
        const animateRow = document.createElement('div');
        animateRow.className = 'voice-assistant-toggle-row';
        
        const animateLabel = document.createElement('span');
        animateLabel.className = 'voice-assistant-toggle-label';
        animateLabel.textContent = 'Animate border';
        
        const animateToggle = document.createElement('label');
        animateToggle.className = 'voice-assistant-toggle';
        
        const animateInput = document.createElement('input');
        animateInput.type = 'checkbox';
        animateInput.checked = this.animatedHighlight;
        
        const animateSlider = document.createElement('span');
        animateSlider.className = 'voice-assistant-toggle-slider';
        
        animateToggle.appendChild(animateInput);
        animateToggle.appendChild(animateSlider);
        
        animateRow.appendChild(animateLabel);
        animateRow.appendChild(animateToggle);
        
        // Footer
        const footer = document.createElement('div');
        footer.className = 'voice-assistant-footer';
        footer.textContent = 'Form Voice Assistant';
        
        // Add event listeners
        enableInput.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.startListening();
            } else {
                this.stopListening();
            }
        });
        
        weightInput.addEventListener('change', (e) => {
            this.setHighlightWeight(e.target.value);
        });
        
        colorPicker.addEventListener('input', (e) => {
            this.setHighlightColor(e.target.value);
            colorText.value = e.target.value;
        });
        
        colorText.addEventListener('change', (e) => {
            // Validate hex color
            const isValidHex = /^#[0-9A-F]{6}$/i.test(e.target.value);
            if (isValidHex) {
                this.setHighlightColor(e.target.value);
                colorPicker.value = e.target.value;
            } else {
                // Reset to current value
                e.target.value = this.highlightColor;
            }
        });
        
        styleSelect.addEventListener('change', (e) => {
            this.setHighlightStyle(e.target.value);
        });
        
        animateInput.addEventListener('change', (e) => {
            this.setAnimatedHighlight(e.target.checked);
        });
        
        // Assemble the panel
        panel.appendChild(header);
        panel.appendChild(enableRow);
        panel.appendChild(customizeTitle);
        panel.appendChild(weightRow);
        panel.appendChild(colorRow);
        panel.appendChild(styleRow);
        panel.appendChild(animateRow);
        panel.appendChild(footer);
        
        return panel;
    }

    // Show the control panel
    showControlPanel() {
        const panel = this.createControlPanel();
        document.body.appendChild(panel);
        
        // Position the panel
        panel.style.position = 'fixed';
        panel.style.top = '20px';
        panel.style.right = '20px';
        panel.style.zIndex = '10000';
        
        return panel;
    }
}

// Initialize the form assistant
const formAssistant = new FormAssistant();

// Add form submission detection
document.addEventListener('submit', function(event) {
    // Get the form that was submitted
    const form = event.target;
    
    // Notify the background script about the form submission
    // Add try-catch for error handling
    try {
        chrome.runtime.sendMessage({
            action: 'formSubmitted',
            url: window.location.href
        }, (response) => {
            // Check for runtime errors
            const lastError = chrome.runtime.lastError;
            if (lastError) {
                console.log('Error sending form submission message:', lastError.message);
            }
        });
    } catch (error) {
        console.log('Error sending message to background script:', error);
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'startVoiceInput':
            formAssistant.setLanguage(message.language);
            if (message.voiceSettings) {
                formAssistant.setVoiceSettings(message.voiceSettings);
            }
            formAssistant.focusOnFirstFormField();
            formAssistant.startListening();
            break;
        case 'stopVoiceInput':
            formAssistant.stopListening();
            break;
        case 'updateLanguage':
            formAssistant.setLanguage(message.language);
            break;
        case 'updateVoiceSettings':
            formAssistant.setVoiceSettings(message.voiceSettings);
            break;
        case 'updateAccessibility':
            formAssistant.applyAccessibilityFeatures(message.settings);
            break;
        case 'formSubmitted':
            // Handle form submission confirmation if needed
            console.log('Form submitted at URL:', message.url);
            break;
        case 'autoFocusForm':
            formAssistant.focusOnFirstFormField();
            break;
        case 'resetForm':
            formAssistant.resetForm();
            break;
        case 'applyCachedData':
            formAssistant.applyCachedData();
            break;
        case 'clearCachedData':
            formAssistant.clearCachedData();
            break;
        case 'clearAllCachedData':
            formAssistant.clearAllCachedData();
            break;
        case 'setCacheEnabled':
            formAssistant.setCacheEnabled(message.enabled);
            break;
        case 'toggleColorTheme':
            formAssistant.toggleColorTheme(message.isDarkMode);
            break;
    }
}); 