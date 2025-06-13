const fs = require('fs').promises;
const path = require('path');

async function updateGeojsonWithImages() {
    try {
        // Load the GeoJSON file
        const geojsonPath = path.join(__dirname, 'NYS_Assembly_Districts_-5307823520461325492.geojson');
        const geojsonData = JSON.parse(await fs.readFile(geojsonPath, 'utf8'));

        // Load the data1.json file
        const data2Path = path.join(__dirname, 'data2.json');
        const imageData = JSON.parse(await fs.readFile(data2Path, 'utf8'));

        // Create a map for quick lookup of image URLs by name
        const imageMap = new Map(imageData.map(item => [item.name, item.imageUrl]));

        // Update the GeoJSON features with image URLs
        geojsonData.features.forEach(feature => {
            const name = feature.properties.Name; // Use "Name" to match the GeoJSON structure
            if (imageMap.has(name)) {
                feature.properties.image_url = imageMap.get(name);
            }
        });

        // Write the updated GeoJSON back to the file
        await fs.writeFile(geojsonPath, JSON.stringify(geojsonData, null, 2));
        console.log('GeoJSON file updated successfully with image URLs.');
    } catch (error) {
        console.error('Error updating GeoJSON file:', error);
    }
}

updateGeojsonWithImages();