import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface OfficeInfo {
    address: string;
    phone: string;
}

interface DistrictData {
    OBJECTID: number;
    district: string;
    census_area: number;
    name: string;
    party: string;
    nj_office: OfficeInfo;
    dc_office: OfficeInfo;
    CDFP: string;
    GlobalID: string;
}

// Read both files
const geojsonPath = join(__dirname, 'NJ_Congressional_Districts.geojson');
const updatedDataPath = join(__dirname, 'NJ_Congressional_Districts_Data.json');
const outputPath = join(__dirname, 'NJ_Congressional_Districts_Updated.geojson');

try {
    // Read and parse both files
    const geojsonData = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
    const updatedData = JSON.parse(readFileSync(updatedDataPath, 'utf-8'));

    // Create a map of updated data by GlobalID for easy lookup
    const updatedDataMap = new Map(
        updatedData.map((district: DistrictData) => [district.GlobalID, district])
    );

    // Update the properties in the GeoJSON features
    geojsonData.features = geojsonData.features.map((feature: any) => {
        const updatedDistrict = updatedDataMap.get(feature.properties.GlobalID);
        if (updatedDistrict) {
            // Directly replace the entire properties object
            feature.properties = updatedDistrict;
        }
        return feature;
    });

    // Write the updated GeoJSON to a new file
    writeFileSync(outputPath, JSON.stringify(geojsonData, null, 2));
    
    console.log('Successfully updated GeoJSON with new properties. Output saved to:', outputPath);
} catch (error) {
    console.error('Error updating GeoJSON:', error);
}
