import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs/promises';
import path from 'path';

// Load your service account key
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'civic-1776.firebasestorage.app',
});

const bucket = admin.getStorage().bucket();

function formatNameForFilename(name: string): string {
  const parts = name.trim().split(/\s+/);
  let formattedName = parts[0].toLowerCase();
  for (let i = 1; i < parts.length; i++) {
    formattedName += parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
  }
  return formattedName.replace(/[^a-zA-Z0-9]/g, '');
}

async function main() {
  // Load your names (from largeImages.json)
  const namesData = await fs.readFile(path.join(__dirname, 'largeImages.json'), 'utf-8');
  const names = JSON.parse(namesData); // [{ name: 'Nick LaLota', ... }, ...]

  // List all files in the images/ folder
  const [files] = await bucket.getFiles({ prefix: 'images/' });

  // Map file names to download URLs
  const fileMap: Record<string, string> = {};
  for (const file of files) {
    // Only process .webp files
    if (!file.name.endsWith('.webp')) continue;
    // file.name is like 'images/nickLaLota.webp'
    const base = path.basename(file.name, path.extname(file.name));
    // Public URL pattern for Firebase Storage
    const url = `https://firebasestorage.googleapis.com/v0/b/civic-1776.firebasestorage.app/o/${encodeURIComponent(file.name)}?alt=media`;
    console.log('Found file:', base);
    fileMap[base] = url;
  }

  // Build optimizedImages.json
  const optimized = names.map((entry: { name: string }) => {
    const formattedName = formatNameForFilename(entry.name);
    console.log('Looking for:', formattedName);
    return {
      name: entry.name,
      imageUrl: fileMap[formattedName] || null,
    };
  });

  await fs.writeFile(path.join(__dirname, 'optimizedImages.json'), JSON.stringify(optimized, null, 2));
  console.log('optimizedImages.json created!');
}

main().catch(console.error);

