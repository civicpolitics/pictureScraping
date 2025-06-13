import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Read the GeoJSON file
const geojsonPath = join(__dirname, 'NY_Congressional_Districts.geojson');
const outputPath = join(__dirname, 'NY_Congressional_Districts_Data.json');
const updatedGeojsonPath = join(__dirname, 'NY_Congressional_Districts_Updated.geojson');

try {
    // Read and parse the GeoJSON file
    const geojsonData = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
    
    // Extract properties from each feature
    const propertiesData = geojsonData.features.map((feature: any) => feature.properties);
    
    // Write the properties data to a new file
    writeFileSync(outputPath, JSON.stringify(propertiesData, null, 2));
    
    console.log('Successfully extracted properties data to:', outputPath);

    // Update the GeoJSON file with the new properties
    geojsonData.features = geojsonData.features.map((feature: any, index: number) => ({
        ...feature,
        properties: propertiesData[index]
    }));

    // Write the updated GeoJSON to a new file
    writeFileSync(updatedGeojsonPath, JSON.stringify(geojsonData, null, 2));
    
    console.log('Successfully updated GeoJSON file to:', updatedGeojsonPath);
} catch (error) {
    console.error('Error processing files:', error);
} 