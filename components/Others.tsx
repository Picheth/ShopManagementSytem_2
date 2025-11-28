import React, { useState } from 'react';
import Modal from './Modal';
import TaxRateForm from './TaxRateForm';
import { MOCK_TAX_RATES_DATA } from '../src/data/mockData';
import type { TaxRate } from '../types';

const Others: React.FC = () => {
    const [taxRates, setTaxRates] = useState<TaxRate[]>(MOCK_TAX_RATES_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [taxRateToDelete, setTaxRateToDelete] = useState<TaxRate | null>(null);


    const handleOpenFormModal = (taxRate: TaxRate | null = null) => {
        setEditingTaxRate(taxRate);
        setIsModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsModalOpen(false);
        setEditingTaxRate(null);
    };

    const handleDeleteClick = (taxRate: TaxRate) => {
        setTaxRateToDelete(taxRate);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (taxRateToDelete) {
            setTaxRates(prev => prev.filter(tr => tr.id !== taxRateToDelete.id));
            setTaxRateToDelete(null);
            setIsDeleteConfirmOpen(false);
        }
    };


    const handleSaveTaxRate = (taxRateData: Omit<TaxRate, 'id'> | TaxRate) => {
        if ('id' in taxRateData) {
            // Editing existing
            setTaxRates(prev => {
                let rates = prev.map(tr => tr.id === taxRateData.id ? taxRateData : tr);
                // If the edited rate is now the default, make sure no others are
                if (taxRateData.isDefault) {
                    rates = rates.map(tr => tr.id === taxRateData.id ? tr : { ...tr, isDefault: false });
                }
                return rates;
            });
        } else {
            // Adding new
            const newTaxRate: TaxRate = {
                ...taxRateData,
                id: `TAX${(taxRates.length + 1).toString().padStart(3, '0')}`
            };
            
            if (newTaxRate.isDefault) {
                setTaxRates(prev => 
                    [...prev.map(tr => ({...tr, isDefault: false})), newTaxRate]
                );
            } else {
                setTaxRates(prev => [...prev, newTaxRate]);
            }
        }
        
        handleCloseFormModal();
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-6">
                <div>
                    <h2 className="text-xl font-semibold text-text-main">Other Settings & Utilities</h2>
                    <p className="text-sm text-text-light mt-1">Manage miscellaneous settings for your business.</p>
                </div>

                <div className="border-t pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                             <h3 className="text-lg font-semibold text-text-main">Manage Tax Rates</h3>
                             <p className="text-sm text-text-light mt-1">Define tax rates for sales and purchases.</p>
                        </div>
                        <button 
                            onClick={() => handleOpenFormModal()}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add New Tax Rate
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {taxRates.map(tax => (
                            <div key={tax.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-md border">
                                <div>
                                    <span className="font-medium text-text-main">{tax.name}</span>
                                    {tax.isDefault && (
                                        <span className="ml-2 text-xs font-semibold text-green-800 bg-green-100 px-2 py-0.5 rounded-full">Default</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-semibold text-primary">{tax.rate.toFixed(2)}%</span>
                                    <button onClick={() => handleOpenFormModal(tax)} className="text-sm font-medium text-secondary hover:text-green-700">Edit</button>
                                    <button 
                                        onClick={() => handleDeleteClick(tax)} 
                                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                                        disabled={tax.isDefault}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseFormModal} title={editingTaxRate ? "Edit Tax Rate" : "Add New Tax Rate"}>
                <TaxRateForm 
                    onClose={handleCloseFormModal} 
                    onSave={handleSaveTaxRate}
                    taxRateToEdit={editingTaxRate}
                />
            </Modal>

            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                {taxRateToDelete && (
                    <div className="space-y-4">
                        <p>Are you sure you want to delete the tax rate <strong>{taxRateToDelete.name}</strong>? This action cannot be undone.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={() => setIsDeleteConfirmOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Others;