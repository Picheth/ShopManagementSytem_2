import React, { useState, useEffect } from 'react';
import type { TaxRate } from '../types';

interface TaxRateFormProps {
  onClose: () => void;
  onSave: (taxRate: Omit<TaxRate, 'id'> | TaxRate) => void;
  taxRateToEdit?: TaxRate | null;
}

const TaxRateForm: React.FC<TaxRateFormProps> = ({ onClose, onSave, taxRateToEdit }) => {
    const [name, setName] = useState('');
    const [rate, setRate] = useState(0);
    const [isDefault, setIsDefault] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const isEditing = !!taxRateToEdit;

    useEffect(() => {
        if (taxRateToEdit) {
            setName(taxRateToEdit.name);
            setRate(taxRateToEdit.rate);
            setIsDefault(taxRateToEdit.isDefault);
        } else {
            setName('');
            setRate(0);
            setIsDefault(false);
        }
    }, [taxRateToEdit]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Tax rate name is required.';
        if (rate < 0) newErrors.rate = 'Rate cannot be negative.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            if (isEditing && taxRateToEdit) {
                onSave({ ...taxRateToEdit, name, rate, isDefault });
            } else {
                onSave({ name, rate, isDefault });
            }
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
             <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Tax Rate Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClasses('name')} placeholder="e.g., Standard VAT" required />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
             <div>
                <label htmlFor="rate" className="block text-sm font-medium text-gray-700">Rate (%)</label>
                <input type="number" id="rate" value={rate} onChange={e => setRate(Number(e.target.value))} className={getInputClasses('rate')} step="0.01" min="0" required />
                {errors.rate && <p className="text-red-500 text-xs mt-1">{errors.rate}</p>}
            </div>
            <div className="relative flex items-start">
                <div className="flex h-5 items-center">
                    <input
                        id="isDefault"
                        name="isDefault"
                        type="checkbox"
                        checked={isDefault}
                        onChange={e => setIsDefault(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        disabled={taxRateToEdit?.isDefault}
                    />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="isDefault" className="font-medium text-gray-700">Set as default tax rate</label>
                    <p className="text-gray-500">This will be the pre-selected tax rate for new transactions.</p>
                </div>
            </div>
             <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    {isEditing ? 'Save Changes' : 'Save Tax Rate'}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default TaxRateForm;