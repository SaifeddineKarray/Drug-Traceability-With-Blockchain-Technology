// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAxQB1DlEW_tU1B7btBCTGJ48NuviwmrYo",
  authDomain: "supplychain-9a3da.firebaseapp.com",
  projectId: "supplychain-9a3da",
  storageBucket: "supplychain-9a3da.appspot.com",
  messagingSenderId: "1001440897319",
  appId: "1:1001440897319:web:7971805f824c45f607e102"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

