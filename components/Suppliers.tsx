
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import Card from './Card';
import Modal from './Modal';
import SupplierForm from './SupplierForm';
import { onSnapshot, addDoc, updateDoc, deleteDoc } from './database';
import type { Supplier, ColumnDefinition } from '../types';

const Suppliers: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(true);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [sortKey, setSortKey] = useState<keyof Supplier | null>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot('suppliers', null, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Supplier[];
            setSuppliers(list);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching suppliers:", error);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleAddNew = () => {
        setSelectedSupplier(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsFormModalOpen(true);
    };

    const handleDelete = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedSupplier) {
            try {
                await deleteDoc('suppliers', selectedSupplier.id);
            } catch (e) {
                console.error("Error deleting supplier", e);
            }
            setIsDeleteConfirmOpen(false);
            setSelectedSupplier(null);
        }
    };

    const handleSort = (key: keyof Supplier) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const handleSaveSupplier = async (supplierData: Omit<Supplier, 'id' | 'totalSpent'> | Supplier) => {
        try {
            if ('id' in supplierData) { // Editing
                await updateDoc('suppliers', supplierData.id, supplierData);
            } else { // Adding
                const newSupplierData = {
                    ...supplierData,
                    totalSpent: 0
                };
                await addDoc('suppliers', newSupplierData);
            }
        } catch (e) {
            console.error("Error saving supplier", e);
        }
        setIsFormModalOpen(false);
        setSelectedSupplier(null);
    };

    const columns: ColumnDefinition<Supplier>[] = [
        { header: 'Supplier Name', accessor: 'name', sortable: true },
        { header: 'Contact Person', accessor: 'contactPerson' },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Total Spent', accessor: 'totalSpent', render: (val) => `$${Number(val).toFixed(2)}`, sortable: true },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
                <div className="flex items-center gap-4">
                    <button onClick={() => handleEdit(row)} className="text-secondary hover:text-green-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
            )
        }
    ];

    const filteredData = useMemo(() => {
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const sortedData = useMemo(() => {
        const dataToSort = [...filteredData];
        if (sortKey) {
            dataToSort.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                if (valA == null || valB == null) return 0;

                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }

                return sortDirection === 'desc' ? -comparison : comparison;
            });
        }
        return dataToSort;
    }, [filteredData, sortKey, sortDirection]);

    const totalSpent = useMemo(() => suppliers.reduce((acc, curr) => acc + curr.totalSpent, 0), [suppliers]);
    
    const handleExport = () => {
        const headers = ['id', 'name', 'contactPerson', 'email', 'phone', 'category', 'totalSpent'].join(',');
        const rows = sortedData.map(s => [s.id, `"${s.name}"`, `"${s.contactPerson}"`, s.email, s.phone, s.category, s.totalSpent].join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'suppliers.csv';
        link.click();
    };
    
    const handleImport = () => alert("This would open a file dialog to import supplier data.");

    return (
        <>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card title="Total Suppliers" value={String(suppliers.length)} change="All active vendors" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125V14.25m-17.25 4.5v-1.875a3.375 3.375 0 013.375-3.375h9.75a3.375 3.375 0 013.375 3.375v1.875m-17.25 4.5h16.5M6 12C5.172 12 4.5 11.328 4.5 10.5S5.172 9 6 9s1.5.672 1.5 1.5S6.828 12 6 12zm9 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z" /></svg>} />
                     <Card title="Total Spent with Suppliers" value={`$${totalSpent.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} change="Lifetime value" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>} />
                </div>
                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Supplier List</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                            <div className="relative w-full sm:w-64">
                                <input type="text" placeholder="Search suppliers..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
                            </div>
                            <button onClick={handleImport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Import</button>
                            <button onClick={handleExport} className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export</button>
                            <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add</button>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
                    ) : (
                        <DataTable columns={columns} data={sortedData} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                    )}
                </div>
            </div>
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedSupplier ? "Edit Supplier" : "Add New Supplier"}>
                <SupplierForm onClose={() => setIsFormModalOpen(false)} onSave={handleSaveSupplier} supplierToEdit={selectedSupplier} />
            </Modal>
             <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                {selectedSupplier && (
                     <div className="space-y-4">
                        <p>Are you sure you want to delete supplier <strong>{selectedSupplier.name}</strong>? This action cannot be undone.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
                            <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Suppliers;
