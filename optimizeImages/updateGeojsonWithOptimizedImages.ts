import fs from 'fs/promises';
import path from 'path';

async function main() {
  // Load optimized images (name + imageUrl)
  const optimizedImagesPath = path.join(__dirname, 'optimizedImages.json');
  const optimizedImagesData = await fs.readFile(optimizedImagesPath, 'utf-8');
  const optimizedImages = JSON.parse(optimizedImagesData); // [{ name, imageUrl }]

  // Build a map for quick lookup by name
  const imageMap = new Map(optimizedImages.map((entry: { name: string, imageUrl: string }) => [entry.name, entry.imageUrl]));

  // Load the GeoJSON data
  const geojsonPath = path.join(__dirname, '../NYGeojsons/city/NYC_City_Council_Districts.geojson');
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
  const outputPath = path.join(__dirname, '../NYGeojsons/city/NYC_City_Council_Districts_Updated.geojson');
  await fs.writeFile(outputPath, JSON.stringify(geojson, null, 2));
  console.log('Successfully updated GeoJSON with optimized image URLs. Output saved to:', outputPath);
}

main().catch(console.error); 