document.addEventListener('DOMContentLoaded', async () => {
    // Initialize UI elements
    const languageSelect = document.getElementById('language');
    const largeTextCheckbox = document.getElementById('largeText');
    const keyboardNavCheckbox = document.getElementById('keyboardNav');
    const autoFocusFormCheckbox = document.getElementById('autoFocusForm');
    const voiceTypeSelect = document.getElementById('voiceType');
    const voiceSpeedInput = document.getElementById('voiceSpeed');
    const speedValueSpan = document.getElementById('speedValue');
    const startVoiceButton = document.getElementById('startVoice');
    const stopVoiceButton = document.getElementById('stopVoice');
    const resetFormButton = document.getElementById('resetForm');
    const darkModeToggle = document.getElementById('darkMode');

    // Check for system dark mode preference
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Load available voices
    loadAvailableVoices();

    // Load saved settings
    chrome.storage.sync.get(
        ['language', 'largeText', 'keyboardNav', 'autoFocusForm', 'voiceType', 'voiceSpeed', 'darkMode'], 
        (result) => {
            if (result.language) languageSelect.value = result.language;
            if (result.largeText) largeTextCheckbox.checked = result.largeText;
            if (result.keyboardNav) keyboardNavCheckbox.checked = result.keyboardNav;
            if (result.autoFocusForm !== undefined) autoFocusFormCheckbox.checked = result.autoFocusForm;
            
            // Set dark mode based on saved preference or system preference
            const isDarkMode = result.darkMode !== undefined ? result.darkMode : prefersDarkMode;
            darkModeToggle.checked = isDarkMode;
            toggleDarkMode(isDarkMode);
            
            if (result.voiceSpeed) {
                voiceSpeedInput.value = result.voiceSpeed;
                speedValueSpan.textContent = parseFloat(result.voiceSpeed).toFixed(1);
            }
            // Voice type will be set after voices load
        }
    );

    // Function to toggle dark mode
    function toggleDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark-mode');
        } else {
            document.documentElement.classList.remove('dark-mode');
        }
    }

    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            const systemPrefersDark = event.matches;
            chrome.storage.sync.get(['darkMode'], (result) => {
                // Only auto-switch if user hasn't set a preference
                if (result.darkMode === undefined) {
                    darkModeToggle.checked = systemPrefersDark;
                    toggleDarkMode(systemPrefersDark);
                }
            });
        });
    }

    // Function to load available voices
    function loadAvailableVoices() {
        // Clear existing options except the default
        while (voiceTypeSelect.options.length > 1) {
            voiceTypeSelect.remove(1);
        }
        
        // Check if speechSynthesis is available
        if ('speechSynthesis' in window) {
            // Get voices from the browser
            let voices = speechSynthesis.getVoices();
            
            // If voices array is empty, wait for them to load
            if (voices.length === 0) {
                speechSynthesis.onvoiceschanged = () => {
                    voices = speechSynthesis.getVoices();
                    populateVoices(voices);
                };
            } else {
                populateVoices(voices);
            }
        }
    }
    
    // Function to populate voice dropdown
    function populateVoices(voices) {
        // Group voices by language
        const voicesByLang = {};
        
        voices.forEach(voice => {
            const langCode = voice.lang.split('-')[0];
            if (!voicesByLang[langCode]) {
                voicesByLang[langCode] = [];
            }
            voicesByLang[langCode].push(voice);
        });
        
        // Add option groups by language
        Object.keys(voicesByLang).sort().forEach(langCode => {
            const langVoices = voicesByLang[langCode];
            
            // Create and add options for this language
            langVoices.forEach(voice => {
                const option = document.createElement('option');
                option.value = voice.name;
                option.textContent = `${voice.name} (${voice.lang})`;
                option.dataset.lang = voice.lang;
                voiceTypeSelect.appendChild(option);
            });
        });
        
        // Set previously saved voice
        chrome.storage.sync.get(['voiceType'], (result) => {
            if (result.voiceType) {
                // Try to find the voice in the dropdown
                const voiceOption = Array.from(voiceTypeSelect.options)
                    .find(option => option.value === result.voiceType);
                
                if (voiceOption) {
                    voiceTypeSelect.value = result.voiceType;
                }
            }
        });
    }

    // Update speech speed display as slider changes
    voiceSpeedInput.addEventListener('input', () => {
        const speedValue = parseFloat(voiceSpeedInput.value).toFixed(1);
        speedValueSpan.textContent = speedValue;
    });

    // Ensure content script is loaded
    async function ensureContentScriptLoaded() {
        try {
            // Get the current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }

            // Check if we can inject scripts in this tab
            if (!tab.url || !(tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
                throw new Error('Cannot inject scripts in this type of page');
            }

            // Try to inject the content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
            });

            // Wait a bit for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 100));

            // Verify the content script is working
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                return response && response.status === 'ok';
            } catch (error) {
                console.error('Content script verification failed:', error);
                return false;
            }
        } catch (error) {
            console.error('Error in ensureContentScriptLoaded:', error);
            return false;
        }
    }

    // Save settings when changed
    languageSelect.addEventListener('change', () => {
        chrome.storage.sync.set({ language: languageSelect.value });
        updatePageLanguage(languageSelect.value);
    });

    largeTextCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ largeText: largeTextCheckbox.checked });
        document.body.classList.toggle('large-text', largeTextCheckbox.checked);
    });

    keyboardNavCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ keyboardNav: keyboardNavCheckbox.checked });
    });
    
    autoFocusFormCheckbox.addEventListener('change', async () => {
        chrome.storage.sync.set({ autoFocusForm: autoFocusFormCheckbox.checked });
        
        // Apply the setting immediately if checked
        if (autoFocusFormCheckbox.checked) {
            try {
                const contentScriptLoaded = await ensureContentScriptLoaded();
                if (contentScriptLoaded) {
                    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tab) {
                        await chrome.tabs.sendMessage(tab.id, { action: 'autoFocusForm' });
                        console.log('Form field focused');
                    }
                }
            } catch (error) {
                console.error('Error applying auto-focus:', error);
            }
        }
    });
    
    // Voice type and speed settings
    voiceTypeSelect.addEventListener('change', () => {
        chrome.storage.sync.set({ voiceType: voiceTypeSelect.value });
        updateVoiceSettings();
    });
    
    voiceSpeedInput.addEventListener('change', () => {
        chrome.storage.sync.set({ voiceSpeed: voiceSpeedInput.value });
        updateVoiceSettings();
    });

    // Request microphone permissions
    function requestMicrophonePermission() {
        return navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
                return true;
            })
            .catch(error => {
                console.error('Microphone permission denied:', error);
                return false;
            });
    }

    // Voice input controls
    startVoiceButton.addEventListener('click', async () => {
        console.log('Initializing...');
        
        try {
            // First ensure content script is loaded
            const contentScriptLoaded = await ensureContentScriptLoaded();
            if (!contentScriptLoaded) {
                throw new Error('Could not initialize content script. Please refresh the page and try again.');
            }

            console.log('Requesting microphone access...');
            const hasPermission = await requestMicrophonePermission();
            
            if (!hasPermission) {
                throw new Error('Microphone access denied');
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab) {
                throw new Error('No active tab found');
            }

            await chrome.tabs.sendMessage(tab.id, {
                action: 'startVoiceInput',
                language: languageSelect.value,
                voiceSettings: {
                    voiceType: voiceTypeSelect.value,
                    voiceSpeed: parseFloat(voiceSpeedInput.value)
                }
            });
            
            console.log('Voice input active');
        } catch (error) {
            console.error('Error:', error);
        }
    });

    stopVoiceButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        try {
            await chrome.tabs.sendMessage(tab.id, { action: 'stopVoiceInput' });
            console.log('Voice input stopped');
        } catch (error) {
            console.error('Error stopping voice input:', error);
        }
    });

    // Reset form control
    resetFormButton.addEventListener('click', async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        try {
            // First ensure content script is loaded
            const contentScriptLoaded = await ensureContentScriptLoaded();
            if (!contentScriptLoaded) {
                throw new Error('Could not initialize content script. Please refresh the page and try again.');
            }
            
            await chrome.tabs.sendMessage(tab.id, { action: 'resetForm' });
            console.log('Form has been reset');
        } catch (error) {
            console.error('Error resetting form:', error);
        }
    });

    // Update voice settings on active tab
    async function updateVoiceSettings() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) return;

        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'updateVoiceSettings',
                voiceSettings: {
                    voiceType: voiceTypeSelect.value,
                    voiceSpeed: parseFloat(voiceSpeedInput.value)
                }
            });
        } catch (error) {
            console.error('Error updating voice settings:', error);
        }
    }

    // Update page language
    async function updatePageLanguage(language) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        try {
            await chrome.tabs.sendMessage(tab.id, {
                action: 'updateLanguage',
                language: language
            });
        } catch (error) {
            console.error('Error updating language:', error);
        }
    }

    // Add dark mode toggle event listener
    darkModeToggle.addEventListener('change', () => {
        const isDarkMode = darkModeToggle.checked;
        toggleDarkMode(isDarkMode);
        chrome.storage.sync.set({ darkMode: isDarkMode });
    });
    
    // Initialize accessibility features
    document.body.classList.toggle('large-text', largeTextCheckbox.checked);
}); 