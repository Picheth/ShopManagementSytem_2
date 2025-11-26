import React from 'react';
import type { Sale } from '../types';

interface SaleDetailProps {
  sale: Sale | null;
  onClose: () => void;
}

const SaleDetail: React.FC<SaleDetailProps> = ({ sale, onClose }) => {
  if (!sale) {
    return (
        <div>
            <p className="text-text-light">Sale details could not be found.</p>
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4">
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
  }

  const today = new Date();
  today.setHours(0,0,0,0);
  const dueDate = sale.dueDate ? new Date(sale.dueDate) : null;
  let currentStatus = sale.status;
  if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
      currentStatus = 'Overdue';
  }
  
  const statusClasses: Record<Sale['status'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Unpaid: 'bg-yellow-100 text-yellow-800',
    'Partially Paid': 'bg-blue-100 text-blue-800',
    Overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-4 -mr-4">
      {/* Header section */}
      <div className="flex justify-between items-start pb-4 border-b">
        <div>
          <h3 className="text-xl font-bold text-primary">Order #{sale.orderId}</h3>
          <p className="text-text-light">Invoice: {sale.saleInvoiceId}</p>
          <p className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">{sale.invoiceType || 'Tax Invoice'}</p>
          <p className="text-text-light mt-1">Date: {sale.date}</p>
          {sale.dueDate && <p className="text-text-light">Due: {sale.dueDate}</p>}
        </div>
        <div className="text-right flex flex-col items-end">
           <span className={`px-3 py-1 mb-2 text-sm font-semibold rounded-full ${statusClasses[currentStatus]}`}>
                {currentStatus}
            </span>
          <p className="font-semibold text-text-main">Billed To:</p>
          <p className="text-text-light">{sale.customer}</p>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <table className="min-w-full">
          <thead className="text-xs uppercase text-text-light bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Product</th>
              <th className="px-4 py-2 text-center font-medium">Qty</th>
              <th className="px-4 py-2 text-right font-medium">Unit Price</th>
              <th className="px-4 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.lineItems.map((item, index) => (
              <tr key={item.productId + index} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-text-main">
                  {item.productName}
                  {item.serialNumber && (
                    <p className="text-xs text-gray-500 font-mono">S/N: {item.serialNumber}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-text-light">{item.quantity}</td>
                <td className="px-4 py-3 text-right text-text-light">${(item.price || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-text-main font-semibold">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end pt-4 border-t">
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="font-medium text-text-light">
                {sale.invoiceType === 'Invoice' ? 'Subtotal:' : 'Exclude-Tax Total:'}
            </span>
            <span className="font-medium text-text-main">${(sale.subtotal || 0).toFixed(2)}</span>
          </div>
          {sale.invoiceType !== 'Invoice' && (
            <div className="flex justify-between">
              <span className="font-medium text-text-light">Tax:</span>
              <span className="font-medium text-text-main">${(sale.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-primary border-t pt-2 mt-2">
            <span>Total:</span>
            <span>${(sale.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer with actions */}
      <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-6">
        <button
          type="button"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => alert('This would open a payment recording form.')}
        >
          Record Payment
        </button>
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          onClick={() => window.print()}
        >
          Print
        </button>
        <div className="flex-grow" /> {/* Spacer */}
        <button
          type="button"
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SaleDetail;