import React, { useState } from 'react';
import type { ExpenseCategoryGroup } from '../data/mockData';

interface ExpenseCategoryFormProps {
  onClose: () => void;
  onSaveCategory: (name: string, subcategories: string[]) => void;
  onSaveSubcategory: (parentId: string, subcategoryName: string) => void;
  parentCategory?: ExpenseCategoryGroup;
}

const ExpenseCategoryForm: React.FC<ExpenseCategoryFormProps> = ({ onClose, onSaveCategory, onSaveSubcategory, parentCategory }) => {
    const [name, setName] = useState('');
    const [subcategories, setSubcategories] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});


    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) {
            newErrors.name = parentCategory ? 'Subcategory name is required.' : 'Category name is required.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        if (parentCategory) {
            onSaveSubcategory(parentCategory.id, name);
        } else {
            const subcategoryArray = subcategories.split(',').map(s => s.trim()).filter(Boolean);
            onSaveCategory(name, subcategoryArray);
        }
        onClose();
    };

    const getInputClasses = (fieldName: string) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors[fieldName] ? 'border-red-500' : ''}`;
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">{parentCategory ? 'Subcategory Name' : 'Category Name'}</label>
                <input 
                    type="text" 
                    id="name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className={getInputClasses('name')} 
                    required 
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            {!parentCategory && (
                <div>
                    <label htmlFor="subcategories" className="block text-sm font-medium text-gray-700">Subcategories (comma-separated, optional)</label>
                    <textarea 
                        id="subcategories" 
                        value={subcategories} 
                        onChange={e => setSubcategories(e.target.value)} 
                        rows={3} 
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" 
                        placeholder="e.g., Online Ads, Flyers, Banners"
                    />
                </div>
            )}
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Save
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ExpenseCategoryForm;