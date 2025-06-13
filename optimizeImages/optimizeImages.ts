import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

interface ImageData {
    imageUrl: string;
    name?: string;
}

export async function downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
}

async function optimizeAndConvertToWebP(imageBuffer: Buffer, outputPath: string): Promise<void> {
    await sharp(imageBuffer)
        .resize(400, 400, { // Resize to 400x400 dimensions
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ 
            quality: 80, // Good balance between quality and size
            effort: 6 // Higher effort for better compression
        })
        .toFile(outputPath);
}

async function processImages(jsonPath='largeImages.json') {
    try {
        // Read the JSON file
        const jsonContent = await fs.readFile(path.join(__dirname, jsonPath), 'utf-8');
        const images: ImageData[] = JSON.parse(jsonContent);

        // Create output directory if it doesn't exist
        const outputDir = path.join(__dirname, 'optimized');
        await fs.mkdir(outputDir, { recursive: true });

        // Process each image
        for (const [index, image] of images.entries()) {
            console.log(`Processing image ${index + 1}: ${image.imageUrl}`);
            try {
                // Download the image
                const imageBuffer = await downloadImage(image.imageUrl);
                
                // Format the name for the filename: first name lowercase, subsequent names camel case
                let formattedName = `president_${index + 1}`;
                if (image.name) {
                    const parts = image.name.trim().split(/\s+/);
                    if (parts.length > 0) {
                        formattedName = parts[0].toLowerCase();
                        for (let i = 1; i < parts.length; i++) {
                            formattedName += parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
                        }
                        // Remove any non-alphanumeric characters
                        formattedName = formattedName.replace(/[^a-zA-Z0-9]/g, '');
                    }
                }
                const filename = `${formattedName}.webp`;
                const outputPath = path.join(outputDir, filename);
                
                // Optimize and convert to WebP
                await optimizeAndConvertToWebP(imageBuffer, outputPath);
                
                console.log(`Successfully processed ${filename}`);
            } catch (error) {
                console.error(`Error processing image at ${image.imageUrl}:`, error);
            }
        }

        console.log('All images have been processed successfully!');
    } catch (error) {
        console.error('Error processing images:', error);
    }
}

export const optimizeImages = async (jsonPath: string) => {
    await processImages(jsonPath);
}