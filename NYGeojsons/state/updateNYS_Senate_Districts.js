const fs = require('fs').promises;
const path = require('path');

async function updateGeojson() {
    try {
        // Load the GeoJSON file
        const geojsonPath = path.join(__dirname, 'NYS_Senate_Districts.geojson');
        const geojsonData = JSON.parse(await fs.readFile(geojsonPath, 'utf8'));

        // Load the data1.json file
        const data1Path = path.join(__dirname, 'dataNYS_Senate_Districts.json');
        const imageData = JSON.parse(await fs.readFile(data1Path, 'utf8'));

        // Create a map for quick lookup of image URLs by name  
        const imageMap = new Map(imageData.map(item => [item.Name, item.Website]));

        // Update the GeoJSON features with image URLs
        geojsonData.features.forEach(feature => {
            const name = feature.properties.Name; // Use "Name" to match the GeoJSON structure
            if (imageMap.has(name)) {
                feature.properties.Website = imageMap.get(name);
            }
        });

        // Write the updated GeoJSON back to the file
        await fs.writeFile(geojsonPath, JSON.stringify(geojsonData, null, 2));
        console.log('GeoJSON file updated successfully');
    } catch (error) {
        console.error('Error updating GeoJSON file:', error);
    }
}

updateGeojson();