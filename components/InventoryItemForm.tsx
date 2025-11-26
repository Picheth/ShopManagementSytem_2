import React, { useState } from 'react';
import type { InventoryItem } from '../types';
import { MOCK_BRANCHES_DATA } from '../data/mockData';

interface InventoryItemFormProps {
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'lastStockCountDate'>) => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ onClose, onSave }) => {
    const [productName, setProductName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState<InventoryItem['category']>('Phone');
    const [quantity, setQuantity] = useState(0);
    const [location, setLocation] = useState('');
    const [costPrice, setCostPrice] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ productName, sku, category, quantity, location, costPrice, sellingPrice });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name</label>
                    <input type="text" id="productName" value={productName} onChange={e => setProductName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
                    <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
            </div>
             <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as InventoryItem['category'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option>Phone</option>
                    <option>Accessory</option>
                    <option>Repair Part</option>
                    <option>Tablet</option>
                </select>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" />
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                     <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
                        <option value="">Select Location</option>
                        {MOCK_BRANCHES_DATA.map(branch => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
                    </select>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700">Cost Price ($)</label>
                    <input type="number" id="costPrice" value={costPrice} onChange={e => setCostPrice(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" step="0.01" />
                </div>
                <div>
                    <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700">Selling Price ($)</label>
                    <input type="number" id="sellingPrice" value={sellingPrice} onChange={e => setSellingPrice(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" step="0.01" />
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Save Item
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};
export default InventoryItemForm;
