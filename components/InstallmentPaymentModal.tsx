import React, { useState } from 'react';
import type { Installment, PaymentMethod } from '../types';
import Modal from './Modal';

interface InstallmentPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  installment: Installment | null;
  onSave: (installmentId: string, paymentDate: string, paymentMethod: PaymentMethod) => void;
}

const InstallmentPaymentModal: React.FC<InstallmentPaymentModalProps> = ({ isOpen, onClose, installment, onSave }) => {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');

  if (!installment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(installment.id, paymentDate, paymentMethod);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Record Payment for Installment #${installment.installmentNumber}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border rounded-md bg-gray-50">
            <div className="flex justify-between"><span>Amount Due:</span><span className="font-bold text-lg">${installment.amountDue.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Due Date:</span><span>{installment.dueDate}</span></div>
        </div>
        <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
            <input type="date" id="paymentDate" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
        </div>
        <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentMethod)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                <option>Cash</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
            </select>
        </div>
        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">Save Payment</button>
            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
        </div>
        </form>
    </Modal>
  );
};

export default InstallmentPaymentModal;
