import fs from 'fs';
import path from 'path';
import { bucket } from './firebase';
import { getDownloadURL } from 'firebase-admin/storage';

const readJsonNames = (): string[] => {
    const largeImagesPath = path.join(__dirname, '../optimizeImages/largeImages.json');
    const largeImages = JSON.parse(fs.readFileSync(largeImagesPath, 'utf-8'));
    return largeImages.map((entry: { name: string; imageUrl: string }) => entry.name);
}

export const formatNameForFilename = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    let formattedName = parts[0].toLowerCase();
    for (let i = 1; i < parts.length; i++) {
      formattedName += parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
    }
    return formattedName.replace(/[^a-zA-Z0-9]/g, '');
}

const getPhotoUrl = async (formattedName: string) => {
    const fileRef = bucket.file(`images/${formattedName}.webp`);
    return await getDownloadURL(fileRef);
}

const main = async () => {
    const names = readJsonNames();
    const entries = [];
    for (let name of names) {
        const formattedName = formatNameForFilename(name);
        entries.push({ name, imageUrl: await getPhotoUrl(formattedName) });
    }

    fs.writeFileSync(path.join(__dirname, '../optimizeImages/optimizedImages.json'), JSON.stringify(entries, null, 2));
}

main();

//og flow
/**
 * 1. identify the geojson where I want to update the images
 * 2. pull the imageUrls and names from that geojson and put them in a json file
 * 3. run optimizeImages.ts to optimize the images and put them in the optimized folder
 * 4. upload the images to firebase
 * 5. use getUrls/index.ts to get the urls and put them in optimizedImages.json
 * 6. map optimizedImages.json back into the master json
 * 7. update geojson with the new properties in the master json
 * 8.upload the new geojson to firebase
 */

//updated flow
/**
 * 1. identify the geojson where I want to update the images
 * 2. pull the imageUrls and names from that geojson and put them in a json file
 * 3. run optimizeImages.ts to optimize the images and put them in the optimized folder
 * 4. upload the images to firebase
 * 5. use getUrls/index.ts to get the urls and put them in optimizedImages.json
 * 7. update geojson with the images in optimizedImages.json
 * 8.upload the new geojson to firebase
 */

/**
 * For House of Representatives:
 * search for and download geojson of congressional districts in the state
 * convert keys to match our format
 * add any new data (entries) to geojson
 *   images
 *   offices
 *   ...
 * upload the geojson to firebase
 */