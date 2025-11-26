
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export const initializeApp = firebase.initializeApp;

export const getFirestore = (app?: any) => firebase.firestore(app);
export const collection = (db: any, path: string) => db.collection(path);
export const doc = (db: any, path: string, ...segments: string[]) => {
    return db.doc([path, ...segments].join('/'));
}
export const getDocs = (query: any) => query.get();
export const addDoc = (coll: any, data: any) => coll.add(data);
export const updateDoc = (docRef: any, data: any) => docRef.update(data);
export const deleteDoc = (docRef: any) => docRef.delete();
export const setDoc = (docRef: any, data: any) => docRef.set(data);
export const onSnapshot = (query: any, observer: any, onError?: any) => query.onSnapshot(observer, onError);

export const query = (queryRef: any, ...constraints: any[]) => {
    let q = queryRef;
    for (const constraint of constraints) {
        if (typeof constraint === 'function') {
             q = constraint(q);
        }
    }
    return q;
};

// Helper to create constraints that the query function can use.
// These mimic the modular SDK but operate on the compat Query object.
export const where = (field: string, op: any, value: any) => (q: any) => q.where(field, op, value);
export const orderBy = (field: string, dir: any) => (q: any) => q.orderBy(field, dir);
export const limit = (n: number) => (q: any) => q.limit(n);
export const startAfter = (doc: any) => (q: any) => q.startAfter(doc);

export type DocumentData = firebase.firestore.DocumentData;
export type DocumentSnapshot<T = DocumentData> = firebase.firestore.DocumentSnapshot<T>;
export type QuerySnapshot<T = DocumentData> = firebase.firestore.QuerySnapshot<T>;
export type FirestoreError = firebase.firestore.FirestoreError;
export type QueryConstraint = (q: any) => any;
