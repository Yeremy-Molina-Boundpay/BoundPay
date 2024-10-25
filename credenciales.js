// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtBURwpXDGJ_d6P2n9dyIZJrJgGVrBbJ8",
  authDomain: "boundpay-taller.firebaseapp.com",
  projectId: "boundpay-taller",
  storageBucket: "boundpay-taller.appspot.com",
  messagingSenderId: "1025371450355",
  appId: "1:1025371450355:web:42aadd19dfd51e83f70086"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };