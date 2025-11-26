
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import PurchaseForm from './PurchaseForm';
import PaymentForm from './PaymentForm';
import { onSnapshotPaginated, addDoc, updateDoc, deleteDoc } from "./database";
import { where, type QueryConstraint, type DocumentSnapshot, type DocumentData } from './firebase';
import type { Purchase, ColumnDefinition, Payment, PaymentMethod, PurchaseLineItem } from '../types';
import PurchaseDetail from './PurchaseDetail';

const PAGE_SIZE = 25;

const generatePurchaseId = (date: string, count: number): string => {
    const prefix = `PO-${date.replace(/-/g, '')}-`;
    return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
};

const getNextId = (prefix: string, count: number): string => {
  return `${prefix}${(count + 1).toString().padStart(5, '0')}`;
};

const Purchases: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Purchase['status']>('All');
  
  // Modals and selections
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<Purchase | null>(null);
  
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

    const unsubscribe = onSnapshotPaginated("purchases", {
      pageSize: PAGE_SIZE,
      orderBy: 'date',
      direction: 'desc',
      startAfterDoc: pageCursors[page - 1] || null,
      filters: filters
    }, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Purchase[];
        setPurchases(list);
        
        const lastVisible = snapshot.docs[snapshot.docs.length - 1] as DocumentSnapshot<DocumentData> | undefined;
        if(lastVisible) {
            setPageCursors(prev => {
                const newCursors = [...prev];
                newCursors[page] = lastVisible;
                return newCursors;
            });
        }
        setIsLastPage(snapshot.docs.length < PAGE_SIZE);
        setIsLoading(false);
    }, (err) => { console.error("Error fetching purchases:", err); setIsLoading(false); });
    return () => unsubscribe();
  }, [page, statusFilter]);
  
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatusFilter(e.target.value as any);
      refetchFirstPage();
  };

  const handleRecordPayment = (purchase: Purchase) => { setSelectedPurchase(purchase); setIsPaymentModalOpen(true); };
  const handleViewDetails = (purchase: Purchase) => { setSelectedPurchase(purchase); setIsDetailModalOpen(true); };
  
  const handleSavePayment = async (paymentDetails: { amount: number; date: string; method: PaymentMethod; notes: string }, transaction: Purchase) => {
      const newPayment: Omit<Payment, 'id'> = { transactionId: `PAY-${Date.now()}`, referenceId: transaction.id, type: 'purchase', ...paymentDetails };
      await addDoc('payments', newPayment);
      const newAmountPaid = transaction.amountPaid + paymentDetails.amount;
      let newStatus: Purchase['status'] = newAmountPaid >= transaction.total ? 'Paid' : 'Partially Paid';
      await updateDoc('purchases', transaction.id, { amountPaid: newAmountPaid, status: newStatus });
      refetchFirstPage();
  };

  const handleEditPurchase = (purchase: Purchase) => { setSelectedPurchase(purchase); setIsAddModalOpen(true); };
  const handleDeletePurchase = (purchase: Purchase) => { setPurchaseToDelete(purchase); setIsDeleteConfirmOpen(true); };

  const confirmDeletePurchase = async () => {
    if (!purchaseToDelete) return;
    try { 
      await deleteDoc("purchases", purchaseToDelete.id); 
      refetchFirstPage();
    } catch (err) { console.error("Error deleting purchase:", err); }
    finally { setIsDeleteConfirmOpen(false); setPurchaseToDelete(null); }
  };

  const handleSavePurchase = async (purchaseData: Partial<Purchase>) => {
    try {
      if (purchaseData.id) {
        await updateDoc("purchases", purchaseData.id, purchaseData);
      } else {
        const newPurchaseId = generatePurchaseId(purchaseData.date!, purchases.length);
        const nextReceivingId = getNextId('RO-', purchases.length);
        const dataToSave = { ...purchaseData, purchaseId: newPurchaseId, receivingId: nextReceivingId };
        const docRef = await addDoc("purchases", dataToSave);
        
        for (const item of (dataToSave.lineItems || []) as PurchaseLineItem[]) {
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                for (const serial of item.serialNumbers) {
                    await addDoc('serializedItems', {
                        serialNumber: serial, productId: item.productId, purchaseId: docRef.id,
                        status: 'In Stock', costPrice: item.price, locationId: 'B001', dateAdded: dataToSave.date,
                    });
                }
            }
        }
      }
      refetchFirstPage();
      setIsAddModalOpen(false);
      setSelectedPurchase(null);
    } catch (err) { console.error("Error saving purchase:", err); }
  };
  
  const handleNextPage = () => !isLastPage && setPage(p => p + 1);
  const handlePrevPage = () => page > 1 && setPage(p => p - 1);

  const columns: ColumnDefinition<Purchase>[] = [
    { header: 'Date', accessor: 'date' }, { header: 'Supplier', accessor: 'supplier' }, { header: 'Supplier Invoice', accessor: 'invoiceId' },
    { header: 'Products', accessor: 'lineItems', render: (items) => { if (!Array.isArray(items)) { return 'No items'; } return items.length > 0 ? `${items[0].productName}${items.length > 1 ? ` + ${items.length-1}` : ''}` : 'No items'; } },
    { header: 'Total', accessor: 'total', render: (val) => `$${Number(val || 0).toFixed(2)}` },
    { header: 'Status', accessor: 'status', render: (status) => (<span className={`px-2 py-1 text-xs font-semibold rounded-full ${ status === 'Paid' ? 'bg-green-100 text-green-800' : status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' : status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800' }`}>{String(status)}</span>) },
    { header: 'Action', accessor: 'id', render: (_, row) => (
        <div className="flex items-center gap-3 whitespace-nowrap">
          <button onClick={() => handleViewDetails(row)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View</button>
          <button onClick={() => handleEditPurchase(row)} className="text-green-700 hover:text-green-800 text-sm font-medium">Edit</button>
          <button onClick={() => handleDeletePurchase(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
          {(row.status === 'Unpaid' || row.status === 'Overdue' || row.status === 'Partially Paid') && ( <button onClick={() => handleRecordPayment(row)} className="text-primary hover:text-primary-dark text-sm font-medium">Pay</button> )}
        </div>
    )}
  ];

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return !term ? purchases : purchases.filter(p => p.supplier?.toLowerCase().includes(term) || p.invoiceId?.toLowerCase().includes(term) || p.id?.toLowerCase().includes(term) || p.purchaseId?.toLowerCase().includes(term) || p.receivingId?.toLowerCase().includes(term) || p.lineItems?.some( i => i.productName?.toLowerCase().includes(term) || i.productId?.toLowerCase().includes(term)));
  }, [purchases, searchTerm]);

  const handleCloseForm = () => { setIsAddModalOpen(false); setSelectedPurchase(null); };

  return (
    <>
      <div className="bg-card p-6 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold text-text-main">All Purchases</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
            <select id="status-filter" value={statusFilter} onChange={handleStatusFilterChange} className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"><option value="All">All Statuses</option><option value="Paid">Paid</option><option value="Unpaid">Unpaid</option><option value="Partially Paid">Partially Paid</option><option value="Overdue">Overdue</option></select>
            <div className="relative w-full sm:w-64"><input type="text" placeholder="Search (on this page)..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div></div>
            <button onClick={() => { setSelectedPurchase(null); setIsAddModalOpen(true); }} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add New Purchase</button>
          </div>
        </div>
        <p className="text-sm text-text-light border-l-4 border-primary pl-3">This table is linked to the <span className="font-semibold">Accounts Payable</span> module to track money owed to suppliers.</p>
        
        {isLoading ? (
            <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredData} />
            <div className="flex justify-between items-center mt-4">
                <button onClick={handlePrevPage} disabled={page === 1 || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                <span className="text-sm text-gray-700">Page {page}</span>
                <button onClick={handleNextPage} disabled={isLastPage || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </>
        )}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={handleCloseForm} title={selectedPurchase ? 'Edit Purchase' : 'Add New Purchase'}><PurchaseForm onClose={handleCloseForm} onSave={handleSavePurchase} nextReceivingId={""} purchaseToEdit={selectedPurchase} /></Modal>
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title={`Record Payment for Invoice #${selectedPurchase?.invoiceId ?? ''}`}>{selectedPurchase && (<PaymentForm purchase={selectedPurchase} onSave={handleSavePayment} onClose={() => setIsPaymentModalOpen(false)} />)}</Modal>
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Purchase Details: ${selectedPurchase?.receivingId ?? ''}`}><PurchaseDetail purchase={selectedPurchase} onClose={() => setIsDetailModalOpen(false)} /></Modal>
      <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">{purchaseToDelete && (<div className="space-y-4"><p>Are you sure you want to delete purchase <strong>{purchaseToDelete.receivingId}</strong> ({purchaseToDelete.invoiceId})? This action cannot be undone.</p><div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse rounded-b-lg"><button onClick={confirmDeletePurchase} className="w-full sm:w-auto inline-flex justify-center rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700 text-sm font-medium">Delete</button><button onClick={() => setIsDeleteConfirmOpen(false)} className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium">Cancel</button></div></div>)}</Modal>
    </>
  );
};

export default Purchases;
