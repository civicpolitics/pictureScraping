import fs from 'fs/promises';
import path from 'path';
import { downloadImage } from '../optimizeImages/optimizeImages';
import sharp from 'sharp';
import { bucket } from '../getUrls/firebase';
import { formatNameForFilename } from '../getUrls/index';
import { getDownloadURL } from 'firebase-admin/storage';

/*
this file: 
1. optimizes images
2. uploads images to firebase
3. gets urls for images
4. updates geojson with image urls

tips:
- make sure largeImage.json has the correct items OR you select the correct json file path
- make sure geojson paths are correct
*/

const optimizeAndConvertToWebP = async (imageBuffer: Buffer): Promise<Buffer> => 
    await sharp(imageBuffer)
        .resize(400, 400, { // Resize to 400x400 dimensions
            fit: 'inside',
            withoutEnlargement: true
        })
        .webp({ 
            quality: 80, // Good balance between quality and size
            effort: 6 // Higher effort for better compression
        })
        .toBuffer();


// Get the JSON file path from command line arguments or use default
const jsonFilePath = process.argv[2] 
    ? path.resolve(process.cwd(), process.argv[2])
    : path.join(__dirname, '../optimizeImages/largeImages.json');

// optimize images
const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
const imageData: { name: string, imageUrl: string }[] = JSON.parse(jsonContent);

let optimizedEntries: { name: string, imageUrl: string }[] = [];
for (const data of imageData) {
    const { name, imageUrl } = data;
    console.log(`Processing image of ${name}: ${imageUrl}`);
    
    const imageBuffer = await downloadImage(imageUrl);
    const optimizedImageBuffer = await optimizeAndConvertToWebP(imageBuffer);

    const formattedName = formatNameForFilename(name);
    const fileRef = bucket.file(`images/${formattedName}.webp`);
    await fileRef.save(optimizedImageBuffer);

    const downloadUrl = await getDownloadURL(fileRef);

    console.log(`Uploaded image of ${name}: ${downloadUrl}`);
    optimizedEntries.push({ name, imageUrl: downloadUrl });
}

await fs.writeFile(path.join(__dirname, '../optimizeImages/optimizedImages.json'), JSON.stringify(optimizedEntries, null, 2));


// update geojson with optimized images
async function main() {
    // Load optimized images (name + imageUrl)
    // const optimizedImagesPath = path.join(__dirname, 'optimizedImages.json');
    // const optimizedImagesData = await fs.readFile(optimizedImagesPath, 'utf-8');
    // const optimizedImages = JSON.parse(optimizedImagesData); // [{ name, imageUrl }]
  
    // Build a map for quick lookup by name
    const imageMap = new Map(optimizedEntries.map((entry: { name: string, imageUrl: string }) => [entry.name, entry.imageUrl]));
  
    // Load the GeoJSON data
    const geojsonPath = path.join(__dirname, '../NYGeojsons/federal/NY_Congressional_Districts.geojson');
    const geojsonData = await fs.readFile(geojsonPath, 'utf-8');
    const geojson = JSON.parse(geojsonData);
  
    // Update imageUrl for each feature while preserving other properties
    geojson.features = geojson.features.map((feature: any) => {
      const repName = feature.properties.name;
      if (imageMap.has(repName)) {
        // Preserve all existing properties and just update the imageUrl
        feature.properties = {
          ...feature.properties,
          imageUrl: imageMap.get(repName)
        };
      }
      return feature;
    });
  
    // Write the updated GeoJSON to a new file
    const outputPath = path.join(__dirname, '../NYGeojsons/federal/NY_Congressional_Districts_Updated.geojson');
    await fs.writeFile(outputPath, JSON.stringify(geojson, null, 2));
    console.log('Successfully updated GeoJSON with optimized image URLs. Output saved to:', outputPath);
  }
  
  main().catch(console.error); 