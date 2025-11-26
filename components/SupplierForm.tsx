import React, { useState, useEffect } from 'react';
import type { Supplier } from '../types';

interface SupplierFormProps {
  onClose: () => void;
  onSave: (supplier: Omit<Supplier, 'id' | 'totalSpent'> | Supplier) => void;
  supplierToEdit?: Supplier | null;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onClose, onSave, supplierToEdit }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [category, setCategory] = useState<Supplier['category']>('Electronics');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const isEditing = !!supplierToEdit;

    useEffect(() => {
        if (supplierToEdit) {
            setName(supplierToEdit.name);
            setContactPerson(supplierToEdit.contactPerson);
            setEmail(supplierToEdit.email);
            setPhone(supplierToEdit.phone);
            setCategory(supplierToEdit.category);
        } else {
            setName('');
            setContactPerson('');
            setEmail('');
            setPhone('');
            setCategory('Electronics');
        }
    }, [supplierToEdit]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Supplier name is required.';
        if (!contactPerson.trim()) newErrors.contactPerson = 'Contact person is required.';
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email address is invalid.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const payload = { name, contactPerson, email, phone, category };
            if (isEditing) {
                onSave({ ...supplierToEdit, ...payload });
            } else {
                onSave(payload);
            }
        }
    };
    
    const getInputClasses = (fieldName: string) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors[fieldName] ? 'border-red-500' : ''}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Supplier Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClasses('name')} placeholder="e.g., Apple Inc." required />
                 {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
             <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">Contact Person</label>
                <input type="text" id="contactPerson" value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={getInputClasses('contactPerson')} placeholder="e.g., Tim Cook" required />
                {errors.contactPerson && <p className="text-red-500 text-xs mt-1">{errors.contactPerson}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={getInputClasses('email')} placeholder="e.g., sales@apple.com" required />
                     {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                 <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className={getInputClasses('phone')} placeholder="e.g., 800-275-2273" />
                </div>
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select id="category" value={category} onChange={e => setCategory(e.target.value as Supplier['category'])} className={getInputClasses('category')}>
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Parts Distributor</option>
                    <option>Others</option>
                </select>
            </div>
             <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">
                    {isEditing ? 'Save Changes' : 'Save Supplier'}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default SupplierForm;