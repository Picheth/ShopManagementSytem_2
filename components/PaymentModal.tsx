import React, { useState, useEffect } from 'react';
import { addDoc } from './database';
import type { Sale, SaleLineItem, InstallmentPlan, Installment } from '../types';
import Modal from './Modal';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: SaleLineItem[];
    customerName: string;
    subtotal: number;
    taxAmount: number;
    taxRateId: string;
    total: number;
    invoiceType: 'Tax Invoice' | 'Invoice';
    // FIX: Corrected signature to pass the full Sale object and added allSales prop.
    onSaleFinalized: (newSale: Sale, newPlan?: InstallmentPlan, newInstallments?: Installment[]) => void;
    allSales: Sale[];
}

const getNextId = (prefix: string, data: Sale[], key: keyof Sale): string => {
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

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, cartItems, customerName, subtotal, taxAmount, taxRateId, total, invoiceType, onSaleFinalized, allSales }) => {
    const [cashReceived, setCashReceived] = useState<number | string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCashReceived('');
            setIsSubmitting(false);
            setIsSuccess(false);
            setError('');
        }
    }, [isOpen]);

    const changeDue = (typeof cashReceived === 'number' && cashReceived >= total) ? cashReceived - total : 0;

    const handleFinalizeSale = async () => {
        setIsSubmitting(true);
        setError('');
        try {
            const salesData = allSales;

            const newSale: Omit<Sale, 'id'> = {
                orderId: getNextId('OR-', salesData, 'orderId'),
                saleInvoiceId: getNextId('SA-', salesData, 'saleInvoiceId'),
                date: new Date().toISOString().split('T')[0],
                customer: customerName,
                lineItems: cartItems,
                subtotal: subtotal,
                taxRateId: taxRateId,
                taxAmount: taxAmount,
                total: total,
                status: 'Paid',
                amountPaid: total,
                invoiceType: invoiceType,
            };

            const docRef = await addDoc("sales", newSale);
            const finalizedSale = { ...newSale, id: docRef.id };
            
            // FIX: Call onSaleFinalized immediately upon success to update parent state.
            onSaleFinalized(finalizedSale);
            setIsSuccess(true);
        } catch (err) {
            console.error("Failed to save sale:", err);
            setError("Could not save the sale. Please try again.");
            setIsSubmitting(false);
        }
    };
    

    if (!isOpen) return null;

    if (isSuccess) {
        return (
            // FIX: The success modal now only needs to call onClose, as the parent state is already updated.
            <Modal isOpen={true} onClose={onClose} title="Sale Completed">
                <div className="text-center py-4">
                    <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-text-main">Transaction Successful</h3>
                    <p className="mt-1 text-sm text-text-light">
                        The sale has been recorded.
                    </p>
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-lg"><span className="font-medium">Total:</span><span className="font-bold">${total.toFixed(2)}</span></div>
                        {typeof cashReceived === 'number' && <div className="flex justify-between"><span className="font-medium">Cash Received:</span><span>${cashReceived.toFixed(2)}</span></div>}
                        {changeDue > 0 && <div className="flex justify-between text-primary font-bold text-xl"><span >Change Due:</span><span>${changeDue.toFixed(2)}</span></div>}
                    </div>
                     <div className="mt-6 flex justify-end gap-3">
                        <button onClick={onClose} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">New Sale</button>
                    </div>
                </div>
            </Modal>
        )
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Finalize Payment">
            <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 text-center">
                    <p className="text-lg font-medium text-text-light">Total Due</p>
                    <p className="text-5xl font-bold text-primary">${total.toFixed(2)}</p>
                </div>

                <div>
                    <label htmlFor="cashReceived" className="block text-sm font-medium text-gray-700">Cash Received</label>
                    <input
                        type="number"
                        id="cashReceived"
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value === '' ? '' : parseFloat(e.target.value))}
                        className="mt-1 block w-full text-center text-2xl py-2 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        placeholder="0.00"
                        step="0.01"
                        autoFocus
                    />
                </div>
                
                {changeDue > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                         <p className="text-md font-medium text-green-700">Change Due</p>
                         <p className="text-3xl font-bold text-green-800">${changeDue.toFixed(2)}</p>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                
                <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button
                        onClick={handleFinalizeSale}
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:bg-primary/50"
                    >
                        {isSubmitting ? 'Saving...' : 'Finalize Sale'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentModal;