import React, { useState } from 'react';
import { MOCK_EXPENSE_CATEGORIES_DATA as MOCK_EXPENSE_CATEGORIES } from '../src/data/mockData';
import type { ExpenseCategoryGroup } from '../src/data/mockData';
import Modal from './Modal';
import ExpenseCategoryForm from './ExpenseCategoryForm';


const ExpenseCategories: React.FC = () => {
    const [categories, setCategories] = useState<ExpenseCategoryGroup[]>(MOCK_EXPENSE_CATEGORIES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParent, setSelectedParent] = useState<ExpenseCategoryGroup | undefined>(undefined);

    const handleOpenModal = (parent?: ExpenseCategoryGroup) => {
        setSelectedParent(parent);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedParent(undefined);
    };

    const handleSaveCategory = (name: string, subcategories: string[]) => {
        const defaultIcon = (
            <span className="w-8 h-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                </svg>
            </span>
        );
        const newCategory: ExpenseCategoryGroup = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            icon: defaultIcon,
            subcategories,
        };
        setCategories(prev => [...prev, newCategory]);
    };

    const handleSaveSubcategory = (parentId: string, subcategoryName: string) => {
        setCategories(prev =>
            prev.map(cat => {
                if (cat.id === parentId) {
                    if (cat.subcategories.includes(subcategoryName)) {
                        return cat;
                    }
                    return { ...cat, subcategories: [...cat.subcategories, subcategoryName].sort() };
                }
                return cat;
            })
        );
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-card p-6 rounded-lg shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-text-main">Standard Expense Categories</h2>
                            <p className="text-sm text-text-light mt-1">
                                A comprehensive list of standard expense categories to help with financial tracking and reporting.
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add Category
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map(category => (
                        <div key={category.id} className="bg-card rounded-lg shadow p-6 flex flex-col hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full mr-4">
                                    {category.icon}
                                </div>
                                <h3 className="text-lg font-bold text-primary">{category.name}</h3>
                            </div>
                            <ul className="space-y-2 text-sm text-text-main list-disc pl-5 flex-1 mb-4">
                                {category.subcategories.map(sub => (
                                    <li key={sub}>{sub}</li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleOpenModal(category)}
                                className="text-sm font-medium text-primary hover:text-primary-dark self-start mt-auto">
                                + Add Subcategory
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedParent ? `Add to "${selectedParent.name}"` : 'Add New Expense Category'}>
                <ExpenseCategoryForm
                    onClose={handleCloseModal}
                    onSaveCategory={handleSaveCategory}
                    onSaveSubcategory={handleSaveSubcategory}
                    parentCategory={selectedParent}
                />
            </Modal>
        </>
    );
};

export default ExpenseCategories;