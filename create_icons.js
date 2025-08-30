const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Source image path - update this to your logo file
const SOURCE_IMAGE = path.join(__dirname, 'logo.png');

// Define icon sizes
const SIZES = [16, 48, 128];

async function generateIcons() {
    try {
        // Load the source image
        const image = await loadImage(SOURCE_IMAGE);
        
        // Generate each icon size
        for (const size of SIZES) {
            // Create canvas with the target size
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');
            
            // Calculate scaling to fit the icon in the canvas
            const scale = Math.min(
                size / image.width,
                size / image.height
            ) * 0.9; // Leave a small margin
            
            // Calculate position to center the image
            const x = (size - image.width * scale) / 2;
            const y = (size - image.height * scale) / 2;
            
            // Draw the image centered and scaled
            ctx.drawImage(
                image, 
                x, y, 
                image.width * scale, 
                image.height * scale
            );
            
            // Save the image
            const buffer = canvas.toBuffer('image/png');
            const outputPath = path.join(iconsDir, `icon${size}.png`);
            fs.writeFileSync(outputPath, buffer);
            
            console.log(`Generated ${outputPath}`);
        }
        
        console.log('All icons generated successfully!');
    } catch (err) {
        console.error('Error generating icons:', err);
    }
}

// Run the icon generator
generateIcons(); 