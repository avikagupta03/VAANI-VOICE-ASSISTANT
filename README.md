# Voice Assisted Form Filler

A Chrome extension that helps users fill out Indian government forms using voice commands and provides multilingual support with accessibility features.

## Features

- Voice input for form filling
- Multilingual support (English, Hindi, Bengali, Tamil, Telugu, Malayalam)
- Real-time translation of form fields using LibreTranslate
- Accessibility features:
  - High contrast mode
  - Large text mode
  - Keyboard navigation
- Form field announcement
- Form completion notification
- Works on all Indian government websites (*.gov.in, *.nic.in)

## Installation

1. Clone this repository or download the source code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Navigate to any Indian government form website
2. Click the extension icon in your Chrome toolbar
3. Select your preferred language
4. Enable any accessibility features you need
5. Click "Start Voice Input" to begin form filling
6. The extension will announce each field name
7. Speak your input for each field
8. The extension will automatically move to the next field
9. When the form is complete, you'll receive a notification

## Requirements

- Google Chrome browser
- Microphone for voice input
- Internet connection for translation services

## Translation Service

This extension uses LibreTranslate, a free and open-source translation service. The translation service is provided through a public endpoint and doesn't require any API key or authentication.

## Accessibility Features

### High Contrast Mode
- Increases contrast between text and background
- Makes text more readable for users with visual impairments

### Large Text Mode
- Increases font size across the form
- Helps users with visual impairments

### Keyboard Navigation
- Enables tab navigation through form fields
- Announces field names while navigating
- Makes the form accessible to keyboard-only users

## Supported Languages

- English (en)
- Hindi (hi)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Malayalam (ml)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 