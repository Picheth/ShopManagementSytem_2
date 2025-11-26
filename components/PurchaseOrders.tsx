
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderDetail from './PurchaseOrderDetail';
import { onSnapshotPaginated } from './database';
import { where, type QueryConstraint, type DocumentSnapshot, type DocumentData } from './firebase';
import type { PurchaseOrder, ColumnDefinition, PurchaseOrderStatus } from '../types';

const PAGE_SIZE = 25;

const getNextId = (prefix: string, data: PurchaseOrder[], key: keyof PurchaseOrder): string => {
    if (!data || data.length === 0) {
        return `${prefix}${'1'.padStart(5, '0')}`;
    }
    const maxId = data.reduce((max, item) => {
        const itemValue = item[key];
        if (typeof itemValue === 'string' && itemValue.startsWith(prefix)) {
            const idNum = parseInt(itemValue.replace(prefix, ''), 10);
            return idNum > max ? idNum : max;
        }
        return max;
    }, 0);
    return `${prefix}${(maxId + 1).toString().padStart(5, '0')}`;
};

const PurchaseOrders: React.FC = () => {
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
    const [isLastPage, setIsLastPage] = useState(false);

    const refetchFirstPage = () => {
        setPage(1);
        setPageCursors([null]);
        setIsLastPage(false);
    };

    useEffect(() => {
        setIsLoading(true);
        const filters: QueryConstraint[] = [];
        if (statusFilter !== 'All') {
            filters.push(where('status', '==', statusFilter));
        }

        const unsubscribe = onSnapshotPaginated('purchaseOrders', {
            pageSize: PAGE_SIZE,
            orderBy: 'orderDate',
            direction: 'desc',
            startAfterDoc: pageCursors[page - 1] || null,
            filters: filters
        }, (snapshot) => {
            const poList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as PurchaseOrder[];
            setPurchaseOrders(poList);

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
            console.error("Error fetching POs:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();

    }, [page, statusFilter]);

    const handleViewDetails = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsDetailModalOpen(true);
    };
    
    const handleEdit = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setIsFormModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedPO(null);
        setIsFormModalOpen(true);
    };

    const handleSave = (poData: PurchaseOrder) => {
        // This should interact with the database, but for now, we'll update local state.
        if (poData.id && purchaseOrders.some(p => p.id === poData.id)) {
            setPurchaseOrders(purchaseOrders.map(p => p.id === poData.id ? poData : p));
        } else {
            const nextId = getNextId('PO-', purchaseOrders, 'id');
            const newPO = { ...poData, id: nextId };
            setPurchaseOrders([newPO, ...purchaseOrders]);
        }
        setIsFormModalOpen(false);
    };
    
    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value as any);
        refetchFirstPage();
    };

    const columns: ColumnDefinition<PurchaseOrder>[] = [
        { header: 'PO Number', accessor: 'id' },
        { header: 'Order Date', accessor: 'orderDate' },
        { header: 'Supplier', accessor: 'supplierName' },
        { header: 'Total', accessor: 'total', render: (val) => `$${Number(val).toFixed(2)}` },
        { 
          header: 'Status', 
          accessor: 'status',
          render: (status) => {
            const statusVal = String(status) as PurchaseOrderStatus;
            const statusClasses = {
                Pending: 'bg-yellow-100 text-yellow-800',
                Received: 'bg-green-100 text-green-800',
                'Partially Received': 'bg-blue-100 text-blue-800',
                Cancelled: 'bg-red-100 text-red-800',
            };
            return (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[statusVal] || 'bg-gray-100 text-gray-800'}`}>
                {statusVal}
              </span>
            );
          }
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
                <div className="space-x-2">
                    <button onClick={() => handleViewDetails(row)} className="text-primary hover:text-primary-dark text-sm font-medium">View</button>
                    <button onClick={() => handleEdit(row)} className="text-secondary hover:text-green-700 text-sm font-medium">Edit</button>
                </div>
            )
        }
    ];

    const clientFilteredData = useMemo(() => {
        if (!searchTerm) return purchaseOrders;
        const search = searchTerm.toLowerCase();
        return purchaseOrders.filter(po => 
            po.id.toLowerCase().includes(search) ||
            po.supplierName.toLowerCase().includes(search)
        );
    }, [purchaseOrders, searchTerm]);
    
    const handleNextPage = () => !isLastPage && setPage(p => p + 1);
    const handlePrevPage = () => page > 1 && setPage(p => p - 1);


    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Purchase Orders</h2>
                    <button 
                        onClick={handleAddNew}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Create New PO
                    </button>
                </div>

                <div className="border-t border-b border-gray-200 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            id="status-filter"
                            className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="All">All Statuses</option>
                            {(['Pending', 'Received', 'Partially Received', 'Cancelled'] as PurchaseOrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">Search (on this page)</label>
                        <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="PO # or Supplier..." className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <>
                        <DataTable 
                            columns={columns} 
                            data={clientFilteredData} 
                        />
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

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedPO ? `Edit Purchase Order: ${selectedPO.id}` : "Create New Purchase Order"}>
                <PurchaseOrderForm 
                    onClose={() => setIsFormModalOpen(false)} 
                    onSave={handleSave}
                    purchaseOrder={selectedPO}
                />
            </Modal>
            
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Purchase Order Details: ${selectedPO?.id}`}>
                <PurchaseOrderDetail purchaseOrder={selectedPO} onClose={() => setIsDetailModalOpen(false)} />
            </Modal>
        </>
    );
};

export default PurchaseOrders;
