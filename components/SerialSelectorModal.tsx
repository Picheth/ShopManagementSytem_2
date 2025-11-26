import React, { useState, useEffect } from 'react';
import { onSnapshot } from './database';
import type { SerializedItem } from '../types';

interface SerialSelectorModalProps {
  productId: string;
  onClose: () => void;
  onSelect: (item: SerializedItem) => void;
  excludedSerials: string[];
}

const SerialSelectorModal: React.FC<SerialSelectorModalProps> = ({ productId, onClose, onSelect, excludedSerials }) => {
    const [availableItems, setAvailableItems] = useState<SerializedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!productId) {
            setError("No product selected.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        // FIX: The onSnapshot function was called with the wrong number of arguments. Added null for the 'options' parameter.
        const unsubscribe = onSnapshot('serializedItems', 
            null,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SerializedItem[];
                const filtered = items.filter(item => 
                    item.productId === productId && 
                    item.status === 'In Stock' &&
                    !excludedSerials.includes(item.serialNumber)
                );
                setAvailableItems(filtered);
                setIsLoading(false);
            },
            (err) => {
                console.error(err);
                setError("Could not load serial numbers.");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();

    }, [productId, excludedSerials]);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-main">Select a Serial Number</h3>
            
            {isLoading && (
                <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            {error && <p className="text-red-500 text-center">{error}</p>}

            {!isLoading && !error && (
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2">
                    {availableItems.length > 0 ? (
                        availableItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className="w-full text-left p-3 border rounded-md hover:bg-primary/10 hover:border-primary transition-colors"
                            >
                                <p className="font-mono font-semibold text-text-main">{item.serialNumber}</p>
                                <p className="text-xs text-text-light">Purchased on {item.dateAdded} for ${item.costPrice.toFixed(2)}</p>
                            </button>
                        ))
                    ) : (
                        <p className="text-center text-text-light p-4 bg-gray-50 rounded-md">
                            No available serial numbers found for this product.
                        </p>
                    )}
                </div>
            )}
            
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SerialSelectorModal;