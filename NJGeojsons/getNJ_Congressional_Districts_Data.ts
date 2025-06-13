import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the GeoJSON file
const geojsonPath = join(__dirname, 'NJ_Congressional_Districts.geojson');
const outputPath = join(__dirname, 'NJ_Congressional_Districts_Data.json');

try {
    // Read and parse the GeoJSON file
    const geojsonData = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
    
    // Extract properties from each feature
    const propertiesData = geojsonData.features.map((feature: any) => feature.properties);
    
    // Write the properties data to a new file
    writeFileSync(outputPath, JSON.stringify(propertiesData, null, 2));
    
    console.log('Successfully extracted properties data to:', outputPath);
} catch (error) {
    console.error('Error processing GeoJSON file:', error);
}
