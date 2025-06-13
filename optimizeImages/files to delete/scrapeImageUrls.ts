import fs from 'fs/promises';
import path from 'path';

async function scrapeImageUrls() {
    const inputPath = path.join(__dirname, 'NY_Congressional_Districts_Data.json');
    const outputPath = path.join(__dirname, 'largeImages.json');

    try {
        const data = await fs.readFile(inputPath, 'utf-8');
        const districts = JSON.parse(data);
        const imageUrls = districts
            .filter((district: any) => typeof district.imageUrl === 'string' && district.imageUrl.length > 0 && typeof district.name === 'string')
            .map((district: any) => ({ name: district.name, imageUrl: district.imageUrl }));

        await fs.writeFile(outputPath, JSON.stringify(imageUrls, null, 2));
        console.log(`Extracted ${imageUrls.length} image URLs to largeImages.json`);
    } catch (error) {
        console.error('Error scraping image URLs:', error);
    }
}

scrapeImageUrls(); 