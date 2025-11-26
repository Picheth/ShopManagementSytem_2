
// Using the 'compat' version of `initializeApp` provides a stable entry point that is less prone to module resolution issues.
import firebase from 'firebase/compat/app';
import "firebase/compat/firestore";
import { 
    getFirestore, 
    collection, 
    onSnapshot as fbOnSnapshot, 
    addDoc as fbAddDoc, 
    updateDoc as fbUpdateDoc, 
    deleteDoc as fbDeleteDoc, 
    doc, 
    getDocs as fbGetDocs,
    setDoc as fbSetDoc,
    query,
    orderBy,
    limit,
    startAfter,
    where,
    type DocumentData,
    type QuerySnapshot,
    type FirestoreError,
    type DocumentSnapshot,
    type QueryConstraint
} from "./firebase";


import { MOCK_SALES_DATA, MOCK_PURCHASES_DATA, MOCK_SERIALIZED_ITEMS_DATA, MOCK_PRODUCTS_DATA, MOCK_SUPPLIERS_DATA, MOCK_CONTACTS_DATA, MOCK_BRANCHES_DATA, MOCK_EXPENSES_DATA, MOCK_PAYMENTS_DATA, MOCK_ACCOUNTS_DATA, MOCK_INVENTORY_DATA, MOCK_REPAIRS_DATA, MOCK_STAFF_DATA, MOCK_STOCK_TRANSFERS_DATA, MOCK_SETTLEMENTS_DATA, MOCK_TAX_RATES_DATA, MOCK_CASH_FLOW_DATA, MOCK_PURCHASE_ORDERS_DATA, MOCK_VARIATIONS_DATA, MOCK_EXPENSE_CATEGORIES_DATA, MOCK_MONTHLY_TAX_PAYMENTS_DATA, MOCK_INSTALLMENT_PLANS_DATA, MOCK_INSTALLMENTS_DATA, MOCK_PRODUCT_MASTERS, MOCK_PRODUCT_VARIATIONS } from '../data/mockData';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
// Use the `initializeApp` from the compat library. It returns an app instance compatible with modular v9 services.
const app = firebase.initializeApp(firebaseConfig);
const db = getFirestore(app);

// Check if we are using Firebase or mock data
const useFirebase = localStorage.getItem('dbMode') === 'firebase';

const mockDb = {
    sales: MOCK_SALES_DATA,
    purchases: MOCK_PURCHASES_DATA,
    serializedItems: MOCK_SERIALIZED_ITEMS_DATA,
    products: MOCK_PRODUCTS_DATA,
    suppliers: MOCK_SUPPLIERS_DATA,
    contacts: MOCK_CONTACTS_DATA,
    branches: MOCK_BRANCHES_DATA,
    expenses: MOCK_EXPENSES_DATA,
    payments: MOCK_PAYMENTS_DATA,
    accounts: MOCK_ACCOUNTS_DATA,
    inventory: MOCK_INVENTORY_DATA,
    repairs: MOCK_REPAIRS_DATA,
    staff: MOCK_STAFF_DATA,
    stockTransfers: MOCK_STOCK_TRANSFERS_DATA,
    settlements: MOCK_SETTLEMENTS_DATA,
    taxRates: MOCK_TAX_RATES_DATA,
    cashFlow: MOCK_CASH_FLOW_DATA,
    purchaseOrders: MOCK_PURCHASE_ORDERS_DATA,
    variations: MOCK_VARIATIONS_DATA,
    expenseCategories: MOCK_EXPENSE_CATEGORIES_DATA,
    monthlyTaxPayments: MOCK_MONTHLY_TAX_PAYMENTS_DATA,
    installmentPlans: MOCK_INSTALLMENT_PLANS_DATA,
    installments: MOCK_INSTALLMENTS_DATA,
    productMasters: MOCK_PRODUCT_MASTERS,
    productVariations: MOCK_PRODUCT_VARIATIONS,
};

type MockDb = typeof mockDb;
type CollectionName = keyof MockDb;

// Exported functions
export const onSnapshot = (
    collectionName: CollectionName,
    options: {
        limit?: number;
        orderBy?: string;
        direction?: 'asc' | 'desc';
    } | null,
    callback: (snapshot: { docs: { id: string; data: () => any }[] }) => void,
    onError: (error: FirestoreError) => void
) => {
    if (useFirebase) {
        const queryConstraints = [];
        if (options?.orderBy) {
            queryConstraints.push(orderBy(options.orderBy, options.direction || 'asc'));
        }
        if (options?.limit) {
            queryConstraints.push(limit(options.limit!));
        }
        const q = query(collection(db, collectionName), ...queryConstraints);
        return fbOnSnapshot(
            q,
            (snapshot: QuerySnapshot<DocumentData>) => callback(snapshot),
            onError
        );
    } else {
        // Mock implementation
        let mockData = [...mockDb[collectionName]];
        if (options?.orderBy) {
             mockData.sort((a: any, b: any) => {
                const valA = a[options.orderBy!];
                const valB = b[options.orderBy!];
                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                return options.direction === 'desc' ? -comparison : comparison;
            });
        }
        if (options?.limit) {
            mockData = mockData.slice(0, options.limit);
        }

        const snapshot = {
            docs: mockData.map((doc: any) => ({
                id: doc.id,
                data: () => doc,
            })),
        };
        setTimeout(() => callback(snapshot), 50); // Simulate async
        return () => {}; // Return a mock unsubscribe function
    }
};

export const onSnapshotPaginated = (
    collectionName: CollectionName,
    options: {
        pageSize: number;
        orderBy: string;
        direction?: 'asc' | 'desc';
        startAfterDoc?: DocumentSnapshot | null;
        filters?: QueryConstraint[];
    },
    callback: (snapshot: QuerySnapshot<DocumentData>) => void,
    onError: (error: FirestoreError) => void
) => {
    if (useFirebase) {
        const collRef = collection(db, collectionName);
        const constraints = [
            ...(options.filters || []),
            orderBy(options.orderBy, options.direction || 'asc'),
            ...(options.startAfterDoc ? [startAfter(options.startAfterDoc)] : []),
            limit(options.pageSize)
        ];
        const q = query(collRef, ...constraints);
        return fbOnSnapshot(q, callback, onError);
    } else {
        // Mock implementation
        let mockData = [...mockDb[collectionName]] as any[];
        
        if (options.filters) {
            options.filters.forEach((filter: any) => {
                // This is a very simplified mock of 'where'. It handles '==', '>=', '<='.
                if (filter._delegate) {
                    const { _field, _op, _value } = filter._delegate;
                    const fieldPath = _field.segments.join('.');
                    mockData = mockData.filter(doc => {
                        if (doc[fieldPath] === undefined) return false;
                        const docValue = doc[fieldPath];
                        if (_op === '==') return docValue == _value;
                        if (_op === '>=') return docValue >= _value;
                        if (_op === '<=') return docValue <= _value;
                        return true;
                    });
                }
            });
        }
        
        mockData.sort((a: any, b: any) => {
            const valA = a[options.orderBy];
            const valB = b[options.orderBy];
            if (valA < valB) return options.direction === 'desc' ? 1 : -1;
            if (valA > valB) return options.direction === 'desc' ? -1 : 1;
            return 0;
        });
        
        const startIndex = options.startAfterDoc ? (options.startAfterDoc as any).mockIndex + 1 : 0;
        const endIndex = startIndex + options.pageSize;
        const pageData = mockData.slice(startIndex, endIndex);

        const snapshot = {
            docs: pageData.map((doc: any, index: number) => ({
                id: doc.id,
                data: () => doc,
                mockIndex: startIndex + index
            })),
            empty: pageData.length === 0
        };

        setTimeout(() => callback(snapshot as unknown as QuerySnapshot<DocumentData>), 50);
        return () => {}; // mock unsubscribe
    }
};

export const addDoc = (collectionName: CollectionName, data: any) => {
    if (useFirebase) {
        return fbAddDoc(collection(db, collectionName), data);
    } else {
        // Mock implementation
        const collection = mockDb[collectionName] as any[];
        const newDoc = { ...data, id: `mock_${Date.now()}` };
        collection.unshift(newDoc);

        // --- SYNC LOGIC FOR PRODUCT FLATTENING (MOCK ONLY) ---
        // When a ProductVariation is created, also create/update the flattened 'products' collection
        // so it appears in the ProductsList.
        if (collectionName === 'productVariations') {
            const master = (mockDb.productMasters as any[]).find(m => m.id === newDoc.productId);
            if (master) {
                const variationName = `${Object.values(newDoc.attributes || {}).filter(Boolean).join(' ')}`;
                const fullName = `${master.name} ${variationName}`;
                
                const flattenedProduct = {
                    ...newDoc,
                    name: fullName,
                    brand: master.brand,
                    model: master.model,
                    category: master.category,
                    productNo: `PR-${newDoc.id}`,
                    variations: {
                        ...newDoc.attributes,
                        storage: newDoc.attributes.storage || '',
                        color: newDoc.attributes.color || '',
                        condition: newDoc.attributes.condition || 'NEW'
                    }
                };
                // Add to the flattened products mock collection
                (mockDb.products as any[]).unshift(flattenedProduct);
            }
        }
        // -----------------------------------------------------

        return Promise.resolve({ id: newDoc.id });
    }
};

export const updateDoc = (collectionName: CollectionName, id: string, data: any) => {
    if (useFirebase) {
        return fbUpdateDoc(doc(db, collectionName, id), data);
    } else {
        // Mock implementation
        const collection = mockDb[collectionName] as any[];
        const index = collection.findIndex((doc: any) => doc.id === id);
        if (index > -1) {
            collection[index] = { ...collection[index], ...data };
        }
        return Promise.resolve();
    }
};

export const deleteDoc = (collectionName: CollectionName, id: string) => {
    if (useFirebase) {
        return fbDeleteDoc(doc(db, collectionName, id));
    } else {
        // Mock implementation
        let collection = mockDb[collectionName] as any[];
        mockDb[collectionName] = collection.filter((doc: any) => doc.id !== id) as any;
        return Promise.resolve();
    }
};

export const setDoc = (collectionName: CollectionName, id: string, data: any) => {
    if (useFirebase) {
        return fbSetDoc(doc(db, collectionName, id), data);
    } else {
        const collection = mockDb[collectionName] as any[];
        const index = collection.findIndex((doc: any) => doc.id === id);
        const newDoc = { ...data, id };
        if (index > -1) {
            collection[index] = newDoc;
        } else {
            collection.push(newDoc);
        }
        return Promise.resolve();
    }
};

export const getDocs = (collectionName: CollectionName) => {
    if (useFirebase) {
        return fbGetDocs(collection(db, collectionName));
    } else {
        // Mock implementation
        const mockData = mockDb[collectionName];
        const snapshot = {
            docs: mockData.map((doc: any) => ({
                id: doc.id,
                data: () => doc,
            })),
        };
        return Promise.resolve(snapshot as unknown as QuerySnapshot<DocumentData>);
    }
};
