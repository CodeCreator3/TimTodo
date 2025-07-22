import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAQdM2FchzQyv6gxTubwEa_B4_4AhDwDag",
  authDomain: "timtodo-5c2d6.firebaseapp.com",
  projectId: "timtodo-5c2d6",
  storageBucket: "timtodo-5c2d6.firebasestorage.app",
  messagingSenderId: "597834128058",
  appId: "1:597834128058:web:07d5e5b594117c7651c083",
  measurementId: "G-ZB0G2H6S8P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);