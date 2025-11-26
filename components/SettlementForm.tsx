import React, { useState } from 'react';
import type { Settlement } from '../types';

interface SettlementFormProps {
    onClose: () => void;
    onSave: (settlement: Omit<Settlement, 'id'>) => void;
}

const SettlementForm: React.FC<SettlementFormProps> = ({ onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<Settlement['type']>('Bank Transfer');
    const [amount, setAmount] = useState(0);
    const [fromAccount, setFromAccount] = useState('Sales Register');
    const [toAccount, setToAccount] = useState('Main Bank Account');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSettlement: Omit<Settlement, 'id'> = { date, type, amount, fromAccount, toAccount, notes };
        onSave(newSettlement);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                    <input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" step="0.01" required />
                </div>
            </div>
            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Settlement Type</label>
                <select id="type" value={type} onChange={e => setType(e.target.value as Settlement['type'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    <option>Bank Transfer</option>
                    <option>Cash Deposit</option>
                    <option>Card Settlement</option>
                    <option>Internal Transfer</option>
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700">From</label>
                    <input type="text" id="fromAccount" value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700">To</label>
                    <input type="text" id="toAccount" value={toAccount} onChange={e => setToAccount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
                </div>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" placeholder="e.g., Daily sales deposit"></textarea>
            </div>
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Save Settlement
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default SettlementForm;