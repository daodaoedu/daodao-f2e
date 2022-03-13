import { useEffect, useState } from "react";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import * as localforage from "localforage";
import toast from "react-hot-toast";
import { getFirestore, collection } from "firebase/firestore";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJK-FKcGHwDy1TMcoJcBdEqbTYpEquUi4",
  authDomain: "daodaoedu-4ae8f.firebaseapp.com",
  projectId: "daodaoedu-4ae8f",
  storageBucket: "daodaoedu-4ae8f.appspot.com",
  messagingSenderId: "653049466612",
  appId: "1:653049466612:web:ba41fadb677499a5ae18a1",
  measurementId: "G-1EV81PDZF5",
};

// https://blog.logrocket.com/refactor-react-app-firebase-v9-web-sdk/
const useFirebase = () => {
  // Initialize Firebase
  const firebaseApp = initializeApp(firebaseConfig);
  //   const analytics = getAnalytics(firebaseApp);
  const auth = getAuth(firebaseApp);
  const googleAuthProvider = new GoogleAuthProvider();
  const facebookAuthProvider = new FacebookAuthProvider();
  const [user, isLoading, isError] = useAuthState(auth);
  // const obj = useAuthState(auth);
  // console.log("obj", obj);
  // const [
  //   value,
  //   // , loading, error
  // ] = useCollection(
  //   collection(getFirestore(firebaseApp), "favoriteCollection"),
  //   {
  //     snapshotListenOptions: { includeMetadataChanges: true },
  //   }
  // );
  // Get data from collection example
  // console.log(
  //   "=>",
  //   value?.docs.map((doc) => doc.data())
  // );

  // 請注意！！一旦使用 gmail 註冊之後就無法使用其他供應商的登入方式了
  const signInWithGoogle = () => {
    signInWithPopup(auth, googleAuthProvider)
      .then((result) => {
        console.log("result", result);
        const { displayName } = result.user;
        toast.success(`歡迎登入 ${displayName}`, {
          style: {
            color: "#16b9b3",
            border: "1px solid #16b9b3",
            marginTop: "70px",
          },
          iconTheme: {
            primary: "#16b9b3",
          },
        });
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("登入失敗", {
          style: {
            marginTop: "70px",
          },
        });
      });
  };

  const signOutWithGoogle = () => {
    signOut(auth)
      .then(() => {
        toast.success(`登出成功`, {
          style: {
            color: "#16b9b3",
            border: "1px solid #16b9b3",
            marginTop: "70px",
          },
          iconTheme: {
            primary: "#16b9b3",
          },
        });
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("登出失敗", {
          style: {
            marginTop: "70px",
          },
        });
      });
  };

  const signInWithFacebook = () => {
    signInWithPopup(auth, facebookAuthProvider)
      .then((result) => {
        console.log("result", result);
        const { displayName } = result.user;
        toast.success(`歡迎登入 ${displayName}`, {
          style: {
            color: "#16b9b3",
            border: "1px solid #16b9b3",
            marginTop: "70px",
          },
          iconTheme: {
            primary: "#16b9b3",
          },
        });
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("登入失敗", {
          style: {
            marginTop: "70px",
          },
        });
      });
  };

  const signOutWithFacebook = () => {
    signOut(auth)
      .then(() => {
        toast.success(`登出成功`, {
          style: {
            color: "#16b9b3",
            border: "1px solid #16b9b3",
            marginTop: "70px",
          },
          iconTheme: {
            primary: "#16b9b3",
          },
        });
      })
      .catch((error) => {
        console.log("error", error);
        toast.error("登出失敗", {
          style: {
            marginTop: "70px",
          },
        });
      });
  };

  return {
    firebaseApp,
    auth,
    googleAuthProvider,
    signInWithGoogle,
    signOutWithGoogle,
    signInWithFacebook,
    signOutWithFacebook,
    user,
    isLoading,
  };
};

export default useFirebase;
