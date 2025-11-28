import React, { useState } from 'react';
import { MOCK_BRANCHES_DATA } from '../src/data/mockData';
import Modal from './Modal';
import BranchForm from './BranchForm';
import type { Branch } from '../types';

const Branches: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES_DATA);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);

    const handleOpenFormModal = (branch: Branch | null = null) => {
        setEditingBranch(branch);
        setIsFormModalOpen(true);
    };
    
    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setEditingBranch(null);
    };
    
    const handleOpenDeleteModal = (branch: Branch) => {
        setBranchToDelete(branch);
        setIsDeleteConfirmOpen(true);
    };
    
    const handleCloseDeleteModal = () => {
        setIsDeleteConfirmOpen(false);
        setBranchToDelete(null);
    };

    const handleSaveBranch = (branchData: Omit<Branch, 'id'> | Branch) => {
        if ('id' in branchData) {
            // Editing existing branch
            setBranches(prev => prev.map(b => b.id === branchData.id ? branchData : b));
        } else {
            // Adding new branch
            const newBranch: Branch = {
                ...branchData,
                id: `B${(branches.length + 1).toString().padStart(3, '0')}`
            };
            setBranches(prev => [...prev, newBranch]);
        }
        handleCloseFormModal();
    };

    const confirmDeleteBranch = () => {
        if (!branchToDelete) return;
        setBranches(prev => prev.filter(b => b.id !== branchToDelete.id));
        handleCloseDeleteModal();
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Branches & Locations</h2>
                    <button 
                        onClick={() => handleOpenFormModal(null)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add New Branch
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {branches.map(branch => (
                    <div key={branch.id} className="bg-card rounded-lg shadow p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
                        <div>
                            <h3 className="text-lg font-bold text-primary">{branch.name}</h3>
                            <p className="text-sm text-text-light mt-2">{branch.address}</p>
                            <div className="mt-4 space-y-2 text-sm text-text-main">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>{branch.phone}</span>
                                </div>
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span>{branch.manager}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => handleOpenFormModal(branch)} className="text-sm font-medium text-primary hover:text-primary-dark">Edit</button>
                             <button onClick={() => handleOpenDeleteModal(branch)} className="text-sm font-medium text-red-500 hover:text-red-700">Delete</button>
                             <button className="text-sm font-medium text-secondary hover:text-green-600">View Inventory</button>
                        </div>
                    </div>
                ))}
            </div>
            
            <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingBranch ? 'Edit Branch' : 'Add New Branch'}>
                <BranchForm onClose={handleCloseFormModal} onSave={handleSaveBranch} branchToEdit={editingBranch} />
            </Modal>
            
            <Modal isOpen={isDeleteConfirmOpen} onClose={handleCloseDeleteModal} title="Confirm Deletion">
                {branchToDelete && (
                    <div className="space-y-4">
                        <p>Are you sure you want to delete the branch <strong>{branchToDelete.name}</strong>? This action cannot be undone.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={confirmDeleteBranch}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={handleCloseDeleteModal}
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

export default Branches;
