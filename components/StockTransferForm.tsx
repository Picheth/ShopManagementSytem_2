import React, { useState } from 'react';
import { MOCK_BRANCHES_DATA } from '../src/data/mockData';
import { MOCK_PRODUCTS_DATA } from '../src/data/mockData';
import type { StockTransfer } from '../types';

interface StockTransferFormProps {
    onClose: () => void;
    onSave: (transferData: Omit<StockTransfer, 'id' | 'status'>) => void;
}

const StockTransferForm: React.FC<StockTransferFormProps> = ({ onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [fromBranch, setFromBranch] = useState('');
    const [toBranch, setToBranch] = useState('');
    const [productName, setProductName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!fromBranch) newErrors.fromBranch = 'Source location is required.';
        if (!toBranch) newErrors.toBranch = 'Destination location is required.';
        if (fromBranch && fromBranch === toBranch) {
            newErrors.toBranch = 'Destination cannot be the same as the source.';
        }
        if (!productName) newErrors.productName = 'A product must be selected.';
        if (quantity <= 0) newErrors.quantity = 'Quantity must be positive.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        
        onSave({ date, fromBranch, toBranch, productName, quantity });
    };

    const getInputClasses = (fieldName: string) => {
        return `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${
            errors[fieldName] ? "border-red-500" : ""
        }`;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fromBranch" className="block text-sm font-medium text-gray-700">From Location</label>
                    <select id="fromBranch" value={fromBranch} onChange={e => setFromBranch(e.target.value)} className={getInputClasses('fromBranch')} required>
                        <option value="">Select source</option>
                        {MOCK_BRANCHES_DATA.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                    {errors.fromBranch && <p className="text-red-500 text-xs mt-1">{errors.fromBranch}</p>}
                </div>
                <div>
                    <label htmlFor="toBranch" className="block text-sm font-medium text-gray-700">To Location</label>
                    <select id="toBranch" value={toBranch} onChange={e => setToBranch(e.target.value)} className={getInputClasses('toBranch')} required>
                        <option value="">Select destination</option>
                        {MOCK_BRANCHES_DATA.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                    </select>
                    {errors.toBranch && <p className="text-red-500 text-xs mt-1">{errors.toBranch}</p>}
                </div>
            </div>
             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <label htmlFor="product" className="block text-sm font-medium text-gray-700">Product</label>
                    <select id="product" value={productName} onChange={e => setProductName(e.target.value)} className={getInputClasses('productName')} required>
                        <option value="">Select a product</option>
                        {MOCK_PRODUCTS_DATA.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                    {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                </div>
                <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className={getInputClasses('quantity')} min="1" required />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Initiate Transfer
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default StockTransferForm;