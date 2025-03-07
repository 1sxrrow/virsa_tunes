export const prodFirebaseConfig = {
  apiKey: process.env.PROD_FIREBASE_API_KEY,
  authDomain: process.env.PROD_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.PROD_FIREBASE_DATABASE_URL,
  projectId: process.env.PROD_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PROD_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PROD_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PROD_FIREBASE_APP_ID,
};

export const devFirebaseConfig = {
  apiKey: process.env.DEV_FIREBASE_API_KEY,
  authDomain: process.env.DEV_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.DEV_FIREBASE_DATABASE_URL,
  projectId: process.env.DEV_FIREBASE_PROJECT_ID,
  storageBucket: process.env.DEV_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.DEV_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.DEV_FIREBASE_APP_ID,
};

export const testAppVirsaConfig = {
  apiKey: 'AIzaSyBX85nM2JehX3ZYMbTaNQT9eEkIjVMiEqk',
  authDomain: 'test-app-virsa.firebaseapp.com',
  databaseURL: 'https://test-app-virsa-default-rtdb.firebaseio.com',
  projectId: 'test-app-virsa',
  storageBucket: 'test-app-virsa.firebasestorage.app',
  messagingSenderId: '543717113947',
  appId: '1:543717113947:web:3ecc6fb2bfbdf79e96ff7e',
  measurementId: 'G-69L46XCLY8',
};
