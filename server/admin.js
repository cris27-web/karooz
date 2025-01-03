import admin from 'firebase-admin';
import serviceAccount from './path/to/serviceAccountKey.json'; // Replace with your service account path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const auth = admin.auth();
export const db = admin.firestore();