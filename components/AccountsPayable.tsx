import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import { onSnapshot, addDoc, updateDoc } from "./database";
import type { Purchase, ColumnDefinition, Payment, PaymentMethod } from '../types';
import Card from './Card';
import Modal from './Modal';
import PaymentForm from './PaymentForm';

const AccountsPayable: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot("purchases", null, (snapshot) => {
            const purchasesList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Purchase[];
            setPurchases(purchasesList);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching real-time purchases: ", error);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const handleRecordPayment = (purchase: Purchase) => {
      setSelectedPurchase(purchase);
      setIsPaymentModalOpen(true);
    };

    const handleSavePayment = async (
      paymentDetails: { amount: number; date: string; method: PaymentMethod; notes: string },
      transaction: Purchase
    ) => {
        const newPayment: Omit<Payment, 'id'> = {
            transactionId: `PAY-${Date.now()}`,
            referenceId: transaction.id,
            type: 'purchase',
            ...paymentDetails
        };
        await addDoc('payments', newPayment);

        const newAmountPaid = transaction.amountPaid + paymentDetails.amount;
        let newStatus: Purchase['status'] = 'Partially Paid';
        if (newAmountPaid >= transaction.total) {
            newStatus = 'Paid';
        }

        await updateDoc('purchases', transaction.id, {
            amountPaid: newAmountPaid,
            status: newStatus
        });
    };

    const columns: ColumnDefinition<Purchase>[] = [
        { header: 'Supplier', accessor: 'supplier' },
        { header: 'Invoice #', accessor: 'invoiceId' },
        { header: 'Date', accessor: 'date' },
        { header: 'Total', accessor: 'total', render: (val) => `$${Number(val).toFixed(2)}` },
        { 
          header: 'Status', 
          accessor: 'status',
          render: (statusValue) => {
            const status = String(statusValue);
            return (
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                status === 'Paid' ? 'bg-green-100 text-green-800' :
                status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
                status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
                }`}>
                {status}
                </span>
            );
          }
        },
         {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
              row.status !== 'Paid' ? (
                <button 
                    onClick={() => handleRecordPayment(row)}
                    className="text-primary hover:text-primary-dark text-sm font-medium">
                    Record Payment
                </button>
              ) : <span className="text-sm text-gray-400">Paid in Full</span>
            )
        }
    ];

    const payableData = useMemo(() => {
        const unpaidPurchases = purchases.filter(p => p.status !== 'Paid');
        if (!searchTerm) {
            return unpaidPurchases;
        }
        return unpaidPurchases.filter(purchase =>
            Object.values(purchase).some(value =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [purchases, searchTerm]);

    const totalPayable = useMemo(() => {
        return payableData.reduce((acc, curr) => acc + (curr.total - curr.amountPaid), 0);
    }, [payableData]);

    const totalOverdue = useMemo(() => {
        return payableData.filter(p => p.status === 'Overdue').reduce((acc, curr) => acc + (curr.total - curr.amountPaid), 0);
    }, [payableData]);
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card 
                        title="Total Payable"
                        value={`$${totalPayable.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                        change={`${payableData.length} invoices`}
                        changeType="increase"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>}
                    />
                    <Card 
                        title="Total Overdue"
                        value={`$${totalOverdue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                        change={`${payableData.filter(p => p.status === 'Overdue').length} invoices`}
                        changeType="decrease"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                    />
                </div>

                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Awaiting Payments to Suppliers</h2>
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <DataTable columns={columns} data={payableData} />
                </div>
            </div>
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title={`Record Payment for Invoice #${selectedPurchase?.invoiceId ?? ''}`}
            >
                {selectedPurchase && (
                <PaymentForm
                    purchase={selectedPurchase}
                    onSave={handleSavePayment}
                    onClose={() => setIsPaymentModalOpen(false)}
                />
                )}
            </Modal>
        </>
    );
};

export default AccountsPayable;