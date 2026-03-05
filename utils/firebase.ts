import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
const firebaseConfig = {
  apiKey: "AIzaSyDd0zhnLbByh0e-BJf4tuIrfDO9ZM7LLSU",
  authDomain: "tot5sblog.firebaseapp.com",
  projectId: "tot5sblog",
  storageBucket: "tot5sblog.firebasestorage.app",
  messagingSenderId: "1028701407721",
  appId: "1:1028701407721:web:a0d7af4012a89e9e66a378",
  measurementId: "G-NEL8Q18EG1"
};


const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);