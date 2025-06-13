import fs from 'fs/promises';
import path from 'path';

async function main() {
  // Load optimized images (name + imageUrl)
  const optimizedImagesPath = path.join(__dirname, 'optimizedImages.json');
  const optimizedImagesData = await fs.readFile(optimizedImagesPath, 'utf-8');
  const optimizedImages = JSON.parse(optimizedImagesData); // [{ name, imageUrl }]

  // Build a map for quick lookup by name
  const imageMap = new Map(optimizedImages.map((entry: { name: string, imageUrl: string }) => [entry.name, entry.imageUrl]));

  // Load the congressional data
  const districtsPath = path.join(__dirname, '../NYGeojsons/federal/NY_Congressional_Districts_Data.json');
  const districtsData = await fs.readFile(districtsPath, 'utf-8');
  const districts = JSON.parse(districtsData);

  // Update imageUrl for each representative
  for (const rep of districts) {
    if (imageMap.has(rep.name)) {
      rep.imageUrl = imageMap.get(rep.name);
    }
  }

  // Write the updated data to a new file
  const outputPath = path.join(__dirname, 'NY_Congressional_Districts_Data_Optimized.json');
  await fs.writeFile(outputPath, JSON.stringify(districts, null, 2));
  console.log('NY_Congressional_Districts_Data_Optimized.json created!');
}

main().catch(console.error);
