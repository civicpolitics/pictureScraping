const fs = require('fs').promises;
const path = require('path');

async function updateGeojson() {
    try {
        // Load the GeoJSON file
        const geojsonPath = path.join(__dirname, 'NYS_Senate_Districts.geojson');
        const geojsonData = JSON.parse(await fs.readFile(geojsonPath, 'utf8'));

        // Update the GeoJSON features with office property
        geojsonData.features.forEach(feature => {
            // Add office property while maintaining original order
            feature.properties.office = "NYS Senator";
        });

        // Write the updated GeoJSON back to the file
        await fs.writeFile(geojsonPath, JSON.stringify(geojsonData, null, 2));
        console.log('GeoJSON file updated successfully');
    } catch (error) {
        console.error('Error updating GeoJSON file:', error);
    }
}

updateGeojson();