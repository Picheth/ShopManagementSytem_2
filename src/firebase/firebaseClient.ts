import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import {
getFirestore,
collection,
doc,
getDocs,
addDoc,
setDoc,
updateDoc,
deleteDoc,
query,
orderBy,
where,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKIeJ-U40e6QmNnylteUBOW8rPxxmKddE",
  authDomain: "phonesystemwebapp.firebaseapp.com",
  projectId: "phonesystemwebapp",
  storageBucket: "phonesystemwebapp.firebasestorage.app",
  messagingSenderId: "295202213590",
  appId: "1:295202213590:web:ec048a0b63dd4a63654377",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);