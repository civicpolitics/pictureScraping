import express from 'express';
import formidable from 'formidable';
import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

// Initialize Firebase Admin (make sure this is done before using admin.storage())
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'civic-1776.firebasestorage.app',
  });
}
const bucket = admin.storage().bucket();

const app = express();

app.post('/upload-image', async (req, res) => {
  const form = formidable({ multiples: true });
  const imageResults: { name: string; imageUrl: string }[] = [];

  form.parse(req, async (err, fields, files) => {
    if (err) {
      res.status(500).json({ success: false, error: err });
      return;
    }

    // Support both single and multiple file uploads
    const fileArray = Array.isArray(files.file) ? files.file : [files.file];

    for (const file of fileArray) {
      const localFilePath = file.filepath || file.path; // Formidable v2 uses .filepath, v1 uses .path
      const fileName = path.basename(localFilePath);
      const remoteFilePath = `images/${fileName}`;

      // Upload to Firebase Storage
      await bucket.upload(localFilePath, { destination: remoteFilePath });

      // Get the download URL with token
      const [metadata] = await bucket.file(remoteFilePath).getMetadata();
      let imageUrl = `https://firebasestorage.googleapis.com/v0/b/civic-1776.firebasestorage.app/o/${encodeURIComponent(remoteFilePath)}?alt=media`;
      if (metadata.metadata && metadata.metadata.firebaseStorageDownloadTokens) {
        imageUrl += `&token=${metadata.metadata.firebaseStorageDownloadTokens}`;
      }

      imageResults.push({ name: fileName.replace('.webp', ''), imageUrl });
    }

    // Write all image URLs to optimizedImages.json
    await fs.writeFile(
      path.join(__dirname, 'optimizedImages.json'),
      JSON.stringify(imageResults, null, 2)
    );

    res.status(200).json({ success: true, urls: imageResults });
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});