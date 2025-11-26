import React from 'react';
import type { Purchase } from '../types';

interface PurchaseDetailProps {
  purchase: Purchase | null;
  onClose: () => void;
}

const PurchaseDetail: React.FC<PurchaseDetailProps> = ({ purchase, onClose }) => {
  if (!purchase) { return null; }

  // FIX: Using Purchase['status'] instead of non-existent PurchaseStatus type
  const statusClasses: Record<Purchase['status'], string> = {
    Paid: 'bg-green-100 text-green-800',
    Unpaid: 'bg-yellow-100 text-yellow-800',
    'Partially Paid': 'bg-blue-100 text-blue-800',
    Overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
        <div className="p-4 border rounded-md bg-gray-50 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-text-main">Supplier:</p>
                    <p className="text-lg text-primary">{purchase.supplier}</p>
                    <p className="text-xs text-text-light">{purchase.supplierContact}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusClasses[purchase.status]}`}>
                    {purchase.status}
                </span>
            </div>
            <div className="flex justify-between text-text-light flex-wrap">
                <span>Receiving Date: {purchase.date}</span>
                <span>Receiving #: {purchase.receivingId}</span>
                <span>Supplier Invoice #: {purchase.invoiceId}</span>
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-md text-text-main mb-2">Items Received</h4>
            <div className="border rounded-md divide-y">
                {purchase.lineItems.map((item, index) => (
                    <div key={index} className="p-3">
                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-2">
                                <p className="font-medium text-text-main">{item.productName}</p>
                                <p className="text-xs text-text-light">{item.productId}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-text-light">Qty</p>
                                <p className="font-semibold">{item.quantity} {item.unit}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-text-light">Total Cost</p>
                                <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        </div>
                        {item.serialNumbers && item.serialNumbers.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-600">Serial Numbers:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
                                    {item.serialNumbers.map(sn => <p key={sn} className="text-xs font-mono bg-gray-100 px-1 rounded">{sn}</p>)}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="border-t pt-4 space-y-2 text-right">
            <div className="flex justify-end items-center gap-4"><span>Items Subtotal:</span><span>${purchase.lineItems.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}</span></div>
            <div className="flex justify-end items-center gap-4"><span>Shipping:</span><span>${(purchase.shippingCost || 0).toFixed(2)}</span></div>
            <div className="flex justify-end items-center gap-4"><span>Other Fees:</span><span>${(purchase.otherFees || 0).toFixed(2)}</span></div>
            <div className="flex justify-end items-center text-xl font-bold text-primary border-t pt-2"><span>Grand Total:</span><span>${(purchase.total || 0).toFixed(2)}</span></div>
        </div>

        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4 sticky bottom-0">
            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Close</button>
        </div>
    </div>
  );
};

export default PurchaseDetail;