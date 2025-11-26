import React, { useState, useEffect } from 'react';
import type { Purchase, PaymentMethod } from '../types';

interface PaymentFormProps {
  onClose: () => void;
  purchase: Purchase;
  onSave: (paymentDetails: { amount: number; date: string; method: PaymentMethod; notes: string }, transaction: Purchase) => Promise<void>;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onClose, purchase, onSave }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amountPaid, setAmountPaid] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (purchase) {
            // Reset all fields when a new purchase is passed in.
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setAmountPaid(purchase.total - purchase.amountPaid);
            setPaymentMethod('Bank Transfer');
            setNotes('');
            setIsSubmitting(false);
            setIsSuccess(false);
        }
    }, [purchase]);

    if (!purchase) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave({
                amount: amountPaid,
                date: paymentDate,
                method: paymentMethod,
                notes,
            }, purchase);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            console.error("Failed to save payment", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 space-y-4">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
                    <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                </div>
                <h3 className="text-xl font-semibold text-text-main">Payment Recorded!</h3>
                <p className="text-text-light">The invoice status has been updated.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-4 border rounded-md bg-gray-50 space-y-2">
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Supplier:</span>
                    <span className="font-semibold text-text-main">{purchase.supplier}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Invoice #:</span>
                    <span className="font-semibold text-text-main">{purchase.invoiceId}</span>
                </div>
                <div className="flex justify-between text-lg">
                    <span className="font-medium text-gray-600">Amount Due:</span>
                    <span className="font-bold text-primary">${(purchase.total - purchase.amountPaid).toFixed(2)}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
                    <input
                        type="date"
                        id="paymentDate"
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">Amount Paid ($)</label>
                    <input
                        type="number"
                        id="amountPaid"
                        value={amountPaid}
                        onChange={e => setAmountPaid(Number(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        min="0.01"
                        step="0.01"
                        required
                    />
                </div>
            </div>
             <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Credit Card</option>
                    <option>Check</option>
                </select>
            </div>
            <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                <textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    placeholder="e.g., Paid via online portal."
                ></textarea>
            </div>

            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button 
                    type="submit" 
                    className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm disabled:bg-primary/50"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : 'Confirm Payment'}
                </button>
                <button 
                    type="button" 
                    onClick={onClose} 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;