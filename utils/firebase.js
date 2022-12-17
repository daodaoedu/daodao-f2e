import { useEffect, useState } from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import * as localforage from 'localforage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBJK-FKcGHwDy1TMcoJcBdEqbTYpEquUi4',
  authDomain: 'daodaoedu-4ae8f.firebaseapp.com',
  projectId: 'daodaoedu-4ae8f',
  storageBucket: 'daodaoedu-4ae8f.appspot.com',
  messagingSenderId: '653049466612',
  appId: '1:653049466612:web:ba41fadb677499a5ae18a1',
  measurementId: 'G-1EV81PDZF5',
};

// https://blog.logrocket.com/refactor-react-app-firebase-v9-web-sdk/
const firebase = async () => {
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  //   const { isSupported, reason } = await analytics.checkEnvSupport();
  //   if (isSupported) {
  //     const analytics = getAnalytics(firebaseApp);
  //   }
  const auth = getAuth(firebaseApp);
  const googleAuthProvider = new GoogleAuthProvider();
  const signInWithGoogle = signInWithPopup(auth, googleAuthProvider)
    .then((result) => result)
    .catch((error) => error);
  return {};
};

export default firebase;
