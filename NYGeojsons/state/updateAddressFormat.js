import fs from 'fs/promises';

async function updateAddressFormat(filePath) {
  try {
    // Read the file
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    
    // For GeoJSON files
    if (data.type === 'FeatureCollection' && data.features) {
      // Update each feature's properties
      data.features.forEach(feature => {
        const props = feature.properties;
        if (props.Address && props.City && props.State) {
          // Include Address2 if it exists
          const address2Part = props.Address2 ? ` ${props.Address2},` : '';
          const zipPart = props.Zip ? ` ${props.Zip}` : '';
          
          // Create combined address
          props.fullAddress = `${props.Address},${address2Part} ${props.City}, ${props.State}${zipPart}`;
          
          // Remove original address fields
          delete props.Address;
          delete props.Address2;
          delete props.City;
          delete props.State;
          delete props.Zip;
        }
      });
    } 
    // For regular JSON data
    else if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.Address && item.City && item.State) {
          // Include Address2 if it exists
          const address2Part = item.Address2 ? ` ${item.Address2},` : '';
          const zipPart = item.Zip ? ` ${item.Zip}` : '';
          
          // Create combined address
          item.fullAddress = `${item.Address},${address2Part} ${item.City}, ${item.State}${zipPart}`;
          
          // Remove original address fields
          delete item.Address;
          delete item.Address2;
          delete item.City;
          delete item.State;
          delete item.Zip;
        }
      });
    }
    
    // Write updated data back to file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Updated address format in ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

// Process all relevant files
async function main() {
  const files = [
    'NYS_Assembly_Districts.geojson',
  ];
  
  for (const file of files) {
    await updateAddressFormat(file);
  }
}

main().catch(console.error); 