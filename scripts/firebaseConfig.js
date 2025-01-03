import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsfqHCiukjDq4h7sQ7G3N9Kz6MYAH52tQ",
    authDomain: "karooz-4b6f3.firebaseapp.com",
    projectId: "karooz-4b6f3",
    storageBucket: "karooz-4b6f3.firebasestorage.app",
    messagingSenderId: "331691826103",
    appId: "1:331691826103:web:86553b97e4517fe2112632"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Optionally, export initializeFirebase if needed elsewhere
export function initializeFirebase() {
    // Firebase has already been initialized above
}