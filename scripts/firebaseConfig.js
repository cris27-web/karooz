import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';

// Firebase configuration using window variables set in index.html
const firebaseConfig = {
    apiKey: window.__FIREBASE_API_KEY__,
    authDomain: window.__FIREBASE_AUTH_DOMAIN__,
    projectId: window.__FIREBASE_PROJECT_ID__,
    storageBucket: window.__FIREBASE_STORAGE_BUCKET__,
    messagingSenderId: window.__FIREBASE_MESSAGING_SENDER_ID__,
    appId: window.__FIREBASE_APP_ID__
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Optionally, export initializeFirebase if needed elsewhere
export function initializeFirebase() {
    // Firebase has already been initialized above
}