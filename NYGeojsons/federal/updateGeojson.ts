import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface OfficeInfo {
    address: string;
    phone: string;
    fax?: string;
    hours?: string;
}

interface DistrictData {
    OBJECTID: number;
    district: number;
    name: string;
    office: string;
    party: string;
    phone: string;
    email: string;
    distPhone: string;
    address: string;
    nyOffice: OfficeInfo;
    nyOffice2?: OfficeInfo;
    nyOffice3?: OfficeInfo;
    nyOffice4?: OfficeInfo;
    dcOffice: OfficeInfo;
    imageUrl: string;
    website: string;
}

// Read both files
const geojsonPath = join(__dirname, 'NY_Congressional_Districts.geojson');
const updatedDataPath = join(__dirname, 'NY_Congressional_Districts_Data.json');
const outputPath = join(__dirname, 'NY_Congressional_Districts_Updated.geojson');

try {
    // Read and parse both files
    const geojsonData = JSON.parse(readFileSync(geojsonPath, 'utf-8'));
    const updatedData = JSON.parse(readFileSync(updatedDataPath, 'utf-8'));

    // Create a map of updated data by GlobalID for easy lookup
    const updatedDataMap = new Map(
        updatedData.map((district: DistrictData) => [district.OBJECTID, district])
    );

    // Update the properties in the GeoJSON features
    geojsonData.features = geojsonData.features.map((feature: any) => {
        const updatedDistrict = updatedDataMap.get(feature.properties.OBJECTID);
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
