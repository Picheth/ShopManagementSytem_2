import { useState, useEffect } from "react";

import { 
  query, 
  collection, 
  orderBy, 
  getDocs, 
  addDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "../firebase/firebaseClient";


export function useFirestoreCollection<T>(collectionName: string) {
const [items, setItems] = useState<T[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<any>(null);


useEffect(() => {
let mounted = true;
const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));


getDocs(q)
.then((snap) => {
if (!mounted) return;
const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as any)) as T[];
setItems(docs);
})
.catch((err) => setError(err))
.finally(() => setLoading(false));


return () => {
mounted = false;
};
}, [collectionName]);


const addItem = async (payload: any) => {
const createdAt = new Date().toISOString();
const ref = await addDoc(collection(db, collectionName), { ...payload, createdAt });
return ref.id;
};


const setItem = async (id: string, payload: any) => {
const ref = doc(db, collectionName, id);
await setDoc(ref, { ...payload, updatedAt: new Date().toISOString() }, { merge: true });
};


const updateItem = async (id: string, payload: any) => {
const ref = doc(db, collectionName, id);
await updateDoc(ref, { ...payload, updatedAt: new Date().toISOString() });
};


const deleteItem = async (id: string) => {
const ref = doc(db, collectionName, id);
await deleteDoc(ref);
};


return { items, loading, error, addItem, setItem, updateItem, deleteItem };
}