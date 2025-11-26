import React, { useState, useMemo } from 'react';
import type { Account } from '../types';

interface AccountFormProps {
  onClose: () => void;
  accounts: Account[];
  onSave: (account: Account) => void;
}

const AccountForm: React.FC<AccountFormProps> = ({ onClose, accounts, onSave }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [type, setType] = useState<Account['type']>('Asset');
    const [subType, setSubType] = useState('');
    const [balance, setBalance] = useState(0);
    const [description, setDescription] = useState('');
    const [parentId, setParentId] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const possibleParents = useMemo(() => {
        return accounts.filter(acc => acc.type === type && !acc.parentId);
    }, [accounts, type]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!id.trim() || !/^\d+$/.test(id)) newErrors.id = 'Account ID must be a number.';
        if (id.length < 4) newErrors.id = 'Account ID must be at least 4 digits.';
        if (accounts.some(acc => acc.id === id)) newErrors.id = 'Account ID already exists.';
        if (!name.trim()) newErrors.name = 'Account name is required.';
        if (!subType.trim()) newErrors.subType = 'Sub-type is required.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const newAccount: Account = { 
                id, 
                name, 
                type, 
                subType, 
                balance, 
                description, 
                parentId: parentId || undefined 
            };
            onSave(newAccount);
        }
    };

    const getInputClasses = (fieldName: string) => {
        let baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm";
        if (errors[fieldName]) {
            baseClasses += " border-red-500 focus:border-red-500 focus:ring-red-500";
        }
        return baseClasses;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700">Account ID</label>
                    <input type="text" id="id" value={id} onChange={e => setId(e.target.value)} className={getInputClasses('id')} placeholder="e.g., 1030" required />
                     {errors.id && <p className="text-red-500 text-xs mt-1">{errors.id}</p>}
                </div>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Account Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClasses('name')} placeholder="e.g., Savings Account" required />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Account Type</label>
                    <select 
                        id="type" 
                        value={type} 
                        onChange={e => {
                            setType(e.target.value as Account['type']);
                            setParentId('');
                        }} 
                        className={getInputClasses('type')}
                    >
                        <option>Asset</option>
                        <option>Liability</option>
                        <option>Equity</option>
                        <option>Revenue</option>
                        <option>Expense</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="subType" className="block text-sm font-medium text-gray-700">Sub-Type</label>
                    <input type="text" id="subType" value={subType} onChange={e => setSubType(e.target.value)} className={getInputClasses('subType')} placeholder="e.g., Current Asset" required />
                    {errors.subType && <p className="text-red-500 text-xs mt-1">{errors.subType}</p>}
                </div>
            </div>
             <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent Account (Optional)</label>
                <select id="parentId" value={parentId} onChange={e => setParentId(e.target.value)} className={getInputClasses('parentId')}>
                    <option value="">None (Top-Level Account)</option>
                    {possibleParents.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name} ({parent.id})</option>
                    ))}
                </select>
            </div>
             <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Opening Balance ($)</label>
                <input type="number" id="balance" value={balance} onChange={e => setBalance(Number(e.target.value))} className={getInputClasses('balance')} step="0.01" />
            </div>
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className={getInputClasses('description')} placeholder="Optional description of the account"></textarea>
            </div>
             <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Save Account
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default AccountForm;
