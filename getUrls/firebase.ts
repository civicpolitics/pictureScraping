import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin with service account
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
if (!serviceAccountPath) {
  throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable must be set');
}

initializeApp({
  credential: cert(serviceAccountPath),
  storageBucket: 'civic-1776.firebasestorage.app'
});

export const bucket = getStorage().bucket();
