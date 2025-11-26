import React, { useState, useEffect } from 'react';
import type { Branch } from '../types';

interface BranchFormProps {
  onClose: () => void;
  onSave: (branch: Omit<Branch, 'id'> | Branch) => void;
  branchToEdit?: Branch | null;
}

const BranchForm: React.FC<BranchFormProps> = ({ onClose, onSave, branchToEdit }) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [manager, setManager] = useState('');

    useEffect(() => {
        if (branchToEdit) {
            setName(branchToEdit.name);
            setAddress(branchToEdit.address);
            setPhone(branchToEdit.phone);
            setManager(branchToEdit.manager);
        } else {
            setName('');
            setAddress('');
            setPhone('');
            setManager('');
        }
    }, [branchToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (branchToEdit) {
            onSave({ ...branchToEdit, name, address, phone, manager });
        } else {
            const newBranch = { name, address, phone, manager };
            onSave(newBranch);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Branch Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
            </div>
             <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <textarea id="address" value={address} onChange={e => setAddress(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="manager" className="block text-sm font-medium text-gray-700">Manager</label>
                    <input type="text" id="manager" value={manager} onChange={e => setManager(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    {branchToEdit ? 'Save Changes' : 'Save Branch'}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default BranchForm;
