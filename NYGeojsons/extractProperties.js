import fs from 'fs/promises';
import path from 'path';

async function extractProperties(filePaths) {
  const allProperties = [];
  
  try {
    for (const filePath of filePaths) {
      console.log(`Processing ${filePath}...`);
      
      // Read and parse the file
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      
      // For GeoJSON files
      if (data.type === 'FeatureCollection' && data.features) {
        console.log(`Found ${data.features.length} features in ${filePath}`);
        
        // Extract properties from each feature
        data.features.forEach((feature, index) => {
          if (feature.properties) {
            // Add source information to help track where this came from
            // const propertyWithSource = {
            //   ...feature.properties,
            //   _sourceFile: path.basename(filePath),
            //   _featureIndex: index
            // };
            allProperties.push(feature.properties);
          }
        });
      } 
      // For regular JSON arrays
      else if (Array.isArray(data)) {
        console.log(`Found ${data.length} items in ${filePath}`);
        
        // Extract properties from each item
        data.forEach((item, index) => {
          // Add source information
        //   const itemWithSource = {
        //     ...item,
        //     _sourceFile: path.basename(filePath),
        //     _itemIndex: index
        //   };
          allProperties.push(item);
        });
      }
      // For JSON objects that aren't arrays or GeoJSON
    //   else {
    //     console.log(`Found a JSON object in ${filePath}`);
    //     // Just add the whole object with source info
    //     allProperties.push({
    //       ...data,
    //       _sourceFile: path.basename(filePath)
    //     });
    //   }
    }
    
    // Write all properties to a new file
    const outputPath = 'consolidated_properties.json';
    await fs.writeFile(outputPath, JSON.stringify(allProperties, null, 2), 'utf8');
    console.log(`✅ Successfully extracted ${allProperties.length} properties to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error extracting properties:', error);
  }
}

// List all the files to process
const filesToProcess = [
  'city/NYC_City_Council_Districts.geojson',
];

// Run the extraction
extractProperties(filesToProcess).catch(console.error); 