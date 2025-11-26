
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import SaleForm from './SaleForm';
import SaleDetail from './SaleDetail';
import { onSnapshotPaginated, addDoc, updateDoc, deleteDoc } from "./database";
import { where, type QueryConstraint, type DocumentSnapshot, type DocumentData } from './firebase';
import type { Sale, ColumnDefinition, SaleLineItem } from '../types';

const PAGE_SIZE = 25;

const getNextId = (prefix: string, count: number): string => {
    return `${prefix}${(count + 1).toString().padStart(5, '0')}`;
};

const SalesBook: React.FC = () => {
    const [salesData, setSalesData] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);
    const [totalSalesCount, setTotalSalesCount] = useState(0);
    
    // Pagination State
    const [page, setPage] = useState(1);
    const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
    const [isLastPage, setIsLastPage] = useState(false);

    // Filters and Sorting
    const [sortKey, setSortKey] = useState<keyof Sale | null>('date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | Sale['status']>('All');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Modals State
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
    
    const refetchFirstPage = () => {
        setPage(1);
        setPageCursors([null]);
        setIsLastPage(false);
    }
    
    useEffect(() => {
        setIsLoading(true);

        const filters: QueryConstraint[] = [];
        if (statusFilter !== 'All') {
            filters.push(where('status', '==', statusFilter));
        }
        if (startDate) {
            filters.push(where('date', '>=', startDate));
        }
        if (endDate) {
            filters.push(where('date', '<=', endDate));
        }

        const unsubscribe = onSnapshotPaginated("sales", {
            pageSize: PAGE_SIZE,
            orderBy: sortKey || 'date',
            direction: sortDirection,
            startAfterDoc: pageCursors[page - 1] || null,
            filters: filters
        }, (snapshot) => {
            const salesList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[];
            setSalesData(salesList);
            
            const lastVisible = snapshot.docs[snapshot.docs.length - 1] as DocumentSnapshot<DocumentData> | undefined;
            if (lastVisible) {
                setPageCursors(prev => {
                    const newCursors = [...prev];
                    newCursors[page] = lastVisible;
                    return newCursors;
                });
            }
            
            setIsLastPage(snapshot.docs.length < PAGE_SIZE);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching sales data: ", error);
            setIsLoading(false);
        });
        
        return () => unsubscribe();
    }, [page, sortKey, sortDirection, statusFilter, startDate, endDate]);

    const handleViewDetails = (sale: Sale) => {
        setSelectedSale(sale);
        setIsDetailModalOpen(true);
    };

    const handleEditSale = (sale: Sale) => {
        setSelectedSale(sale);
        setIsFormModalOpen(true);
    };

    const handleDeleteSale = (sale: Sale) => {
        setSaleToDelete(sale);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteSale = async () => {
        if (!saleToDelete) return;
        try {
            await deleteDoc("sales", saleToDelete.id);
            const serialsToRevert = saleToDelete.lineItems.filter(i => i.serializedItemId).map(i => i.serializedItemId);
            for (const serialId of serialsToRevert) {
                if (serialId) {
                    await updateDoc("serializedItems", serialId, { status: "In Stock", saleId: "" });
                }
            }
            refetchFirstPage();
        } catch (error) {
            console.error("Error deleting sale: ", error);
        } finally {
            setIsDeleteConfirmOpen(false);
            setSaleToDelete(null);
        }
    };

    const handleSaveSale = async (saleData: Omit<Sale, 'id'> | Sale) => {
        try {
            if ('id' in saleData && saleData.id) { // UPDATE
                await updateDoc("sales", saleData.id, { ...saleData });
            } else { // CREATE
                const nextOrderId = getNextId('OR-', totalSalesCount);
                const nextSaleInvoiceId = getNextId('SA-', totalSalesCount);
                const saleToSave = { ...saleData, orderId: nextOrderId, saleInvoiceId: nextSaleInvoiceId };
                const docRef = await addDoc("sales", saleToSave);

                for (const item of saleToSave.lineItems) {
                    if (item.serializedItemId) {
                        await updateDoc("serializedItems", item.serializedItemId, { status: "Sold", saleId: docRef.id });
                    }
                }
            }
            refetchFirstPage();
            setIsFormModalOpen(false);
            setSelectedSale(null);
        } catch (error) {
            console.error("Error saving document: ", error);
        }
    };
    
    const filteredData = useMemo(() => {
        if (!searchTerm) return salesData;
        const lowercasedTerm = searchTerm.toLowerCase();
        return salesData.filter(sale => sale.orderId.toLowerCase().includes(lowercasedTerm) || sale.saleInvoiceId.toLowerCase().includes(lowercasedTerm) || sale.customer.toLowerCase().includes(lowercasedTerm));
    }, [salesData, searchTerm]);

    const handleSort = (key: keyof Sale) => { 
        if (sortKey === key) { 
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); 
        } else { 
            setSortKey(key); 
            setSortDirection('asc'); 
        }
        refetchFirstPage();
    };
    
    const handleNextPage = () => !isLastPage && setPage(p => p + 1);
    const handlePrevPage = () => page > 1 && setPage(p => p - 1);

    const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setter(e.target.value);
        refetchFirstPage();
    };
    
    const getRowClassName = (sale: Sale) => { const today = new Date(); today.setHours(0, 0, 0, 0); const dueDate = sale.dueDate ? new Date(sale.dueDate) : null; if ((sale.status === 'Unpaid' || sale.status === 'Partially Paid') && dueDate && dueDate < today) { return 'bg-red-50 hover:bg-red-100'; } return 'hover:bg-gray-50'; };

    const columns: ColumnDefinition<Sale>[] = [
        { header: 'Order ID', accessor: 'orderId', sortable: true },
        { header: 'Sale Invoice', accessor: 'saleInvoiceId', sortable: true },
        { header: 'Date', accessor: 'date', sortable: true },
        { header: 'Customer', accessor: 'customer' },
        { header: 'Products', accessor: 'lineItems', render: (items) => { if (!Array.isArray(items)) { return 'No items'; }; return items.length > 0 ? `${items[0].productName}${items.length > 1 ? ` + ${items.length-1}` : ''}` : 'No items'; }},
        { header: 'Total', accessor: 'total', render: (val) => `$${Number(val).toFixed(2)}`, sortable: true },
        { header: 'Status', accessor: 'status', sortable: true, render: (status, row) => { 
            const today = new Date();
            today.setHours(0,0,0,0);
            const dueDate = row.dueDate ? new Date(row.dueDate) : null;
            let currentStatus = row.status;
            if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
                currentStatus = 'Overdue';
            }
            const statusClasses: Record<string, string> = {
                Paid: 'bg-green-100 text-green-800',
                Unpaid: 'bg-yellow-100 text-yellow-800',
                'Partially Paid': 'bg-blue-100 text-blue-800',
                Overdue: 'bg-red-100 text-red-800',
              };
            return (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                    {currentStatus}
                </span>
            );
        }},
         { header: 'Actions', accessor: 'id', render: (_, row) => (
            <div className="flex items-center gap-4 whitespace-nowrap">
                <button onClick={() => handleViewDetails(row)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
                <button onClick={() => handleEditSale(row)} className="text-secondary hover:text-green-700 text-sm font-medium">Edit</button>
                <button onClick={() => handleDeleteSale(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
            </div>
        )}
    ];

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Sales Book</h2>
                    <button onClick={() => { setSelectedSale(null); setIsFormModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> Add New Sale </button>
                </div>
                <div className="border-t border-b border-gray-200 py-4 flex flex-wrap gap-4 items-end">
                    <div className="flex-grow min-w-[250px]"><label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">Search (on this page)</label><input type="text" id="search-filter" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Order, Invoice, or Customer..." className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" /></div>
                    <div className="flex-grow min-w-[150px]"><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={statusFilter} onChange={handleFilterChange(setStatusFilter)} className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 sm:text-sm"><option value="All">All Statuses</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option><option value="Partially Paid">Partially Paid</option><option value="Overdue">Overdue</option></select></div>
                    <div className="flex-grow min-w-[150px]"><label className="block text-sm font-medium text-gray-700 mb-1">From Date</label><input type="date" value={startDate} onChange={handleFilterChange(setStartDate)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" /></div>
                    <div className="flex-grow min-w-[150px]"><label className="block text-sm font-medium text-gray-700 mb-1">To Date</label><input type="date" value={endDate} onChange={handleFilterChange(setEndDate)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" /></div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <>
                        <DataTable columns={columns} data={filteredData} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} rowClassName={getRowClassName} />
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={handlePrevPage} disabled={page === 1 || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Previous
                            </button>
                            <span className="text-sm text-gray-700">Page {page}</span>
                            <button onClick={handleNextPage} disabled={isLastPage || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
            <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setSelectedSale(null); }} title={selectedSale ? "Edit Sale" : "Add New Sale"}><SaleForm onClose={() => { setIsFormModalOpen(false); setSelectedSale(null); }} onSave={handleSaveSale} saleToEdit={selectedSale} /></Modal>
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Sale Invoice: ${selectedSale?.saleInvoiceId}`}><SaleDetail sale={selectedSale} onClose={() => setIsDetailModalOpen(false)} /></Modal>
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">{saleToDelete && (<div className="space-y-4"><p>Are you sure you want to delete sale <strong>{saleToDelete.saleInvoiceId}</strong>? This will revert the stock for any serialized items. This action cannot be undone.</p><div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg"><button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm" onClick={confirmDeleteSale}>Delete</button><button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => { setIsDeleteConfirmOpen(false); setSaleToDelete(null); }}>Cancel</button></div></div>)}</Modal>
        </>
    );
};

export default SalesBook;
