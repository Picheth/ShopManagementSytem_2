import React from 'react';
import type { PurchaseOrder, PurchaseOrderStatus } from '../types';

interface PurchaseOrderDetailProps {
  purchaseOrder: PurchaseOrder | null;
  onClose: () => void;
}

const PurchaseOrderDetail: React.FC<PurchaseOrderDetailProps> = ({ purchaseOrder, onClose }) => {
  if (!purchaseOrder) { return null; }

  const statusClasses: Record<PurchaseOrderStatus, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Received: 'bg-green-100 text-green-800',
    'Partially Received': 'bg-blue-100 text-blue-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
        <div className="p-4 border rounded-md bg-gray-50 space-y-2">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-semibold text-text-main">Supplier:</p>
                    <p className="text-lg text-primary">{purchaseOrder.supplierName}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusClasses[purchaseOrder.status]}`}>
                    {purchaseOrder.status}
                </span>
            </div>
            <div className="flex justify-between text-text-light flex-wrap">
                <span>Order Date: {purchaseOrder.orderDate}</span>
                {purchaseOrder.expectedDeliveryDate && <span>Expected By: {purchaseOrder.expectedDeliveryDate}</span>}
                {purchaseOrder.receivedDate && <span className="font-semibold text-green-600">Received On: {purchaseOrder.receivedDate}</span>}
            </div>
        </div>

        <div>
            <h4 className="font-semibold text-md text-text-main mb-2">Order Items</h4>
            <div className="border rounded-md">
                <table className="min-w-full"><thead className="bg-gray-50 text-xs text-text-light"><tr>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Unit Price</th>
                    <th className="px-4 py-2 text-right">Subtotal</th>
                </tr></thead>
                <tbody className="divide-y">
                    {purchaseOrder.lineItems.map(item => (
                         <tr key={item.productId}>
                            <td className="px-4 py-2 font-medium text-text-main">{item.productName}<br/><span className="text-xs text-text-light">{item.productId}</span></td>
                            <td className="px-4 py-2 text-center">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-2 text-right">${(item.price || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-semibold">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody></table>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                {purchaseOrder.notes && (
                    <>
                        <h4 className="font-semibold text-md text-text-main mb-1">Notes</h4>
                        <p className="p-2 border rounded-md bg-gray-50 text-text-light">{purchaseOrder.notes}</p>
                    </>
                )}
            </div>
            <div className="border-t pt-2 space-y-2 text-right">
                <div className="flex justify-end items-center gap-4"><span>Subtotal:</span><span>${(purchaseOrder.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-end items-center gap-4"><span>Shipping:</span><span>${(purchaseOrder.shippingCost || 0).toFixed(2)}</span></div>
                <div className="flex justify-end items-center gap-4"><span>Tax:</span><span>${(purchaseOrder.tax || 0).toFixed(2)}</span></div>
                <div className="flex justify-end items-center text-xl font-bold text-primary border-t pt-2"><span>Total:</span><span>${(purchaseOrder.total || 0).toFixed(2)}</span></div>
            </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-6 sm:flex sm:flex-row-reverse rounded-b-lg mt-4 sticky bottom-0">
            <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Close</button>
        </div>
    </div>
  );
};

export default PurchaseOrderDetail;