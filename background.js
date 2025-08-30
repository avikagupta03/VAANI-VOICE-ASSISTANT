// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    // Initialize default settings
    chrome.storage.sync.set({
        language: 'en',
        highContrast: false,
        largeText: false,
        keyboardNav: true,
        autoFocusForm: true  // Add new setting for auto-focus feature
    });
});

// Listen for tab updates to ensure content script is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        })
        .then(() => {
            // After content script is loaded, check if we should auto-focus on forms
            chrome.storage.sync.get(['autoFocusForm'], (data) => {
                if (data.autoFocusForm) {
                    // Send message to focus on first form field
                    chrome.tabs.sendMessage(tabId, {
                        action: 'autoFocusForm'
                    }).catch(error => {
                        console.error('Failed to send autoFocusForm message:', error);
                    });
                }
            });
        })
        .catch(error => {
            console.error('Failed to inject content script:', error);
        });
    }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'contentScriptLoaded') {
        console.log('Content script loaded in tab:', sender.tab.id);
        sendResponse({ status: 'acknowledged' });
        
        // When content script loads, check if we should auto-focus
        chrome.storage.sync.get(['autoFocusForm'], (data) => {
            if (data.autoFocusForm) {
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'autoFocusForm'
                }).catch(error => {
                    console.error('Failed to send autoFocusForm message:', error);
                });
            }
        });
    }
    return true;
});

// Handle form completion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'formCompleted') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Form Filling Complete',
            message: 'Your form has been successfully filled out!'
        });
    }
    
    // Handle form submission - now triggered from content script
    else if (message.action === 'formSubmitted') {
        // Show a submission notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Form Submitted',
            message: 'Your form has been successfully submitted!'
        });
        
        // Add try-catch to handle potential errors
        try {
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'formSubmitted',
                url: message.url
            }, (response) => {
                const lastError = chrome.runtime.lastError;
                // Just suppress the error without doing anything
                if (lastError) {
                    console.log('Could not send message to tab:', lastError.message);
                }
            });
        } catch (error) {
            console.log('Error sending message:', error);
        }
    }
    
    return true; // Keep the message channel open for async responses
});

// Function to safely send messages to tabs
function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            try {
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    const lastError = chrome.runtime.lastError;
                    // Just suppress the error
                    if (lastError) {
                        console.log('Could not send message to tab:', lastError.message);
                    }
                });
            } catch (error) {
                console.log('Error sending message:', error);
            }
        }
    });
}

// Handle accessibility settings changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
        sendMessageToActiveTab({
            action: 'updateAccessibility',
            settings: changes
        });
    }
});

// Handle language changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.language) {
        sendMessageToActiveTab({
            action: 'updateLanguage',
            language: changes.language.newValue
        });
    }
}); 