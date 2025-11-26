import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS_DATA, MOCK_SUPPLIERS_DATA } from '../data/mockData';
import type { PurchaseOrder, Product, PurchaseLineItem, PurchaseOrderStatus } from '../types';

interface PurchaseOrderFormProps {
  onClose: () => void;
  onSave: (po: PurchaseOrder) => void;
  purchaseOrder: PurchaseOrder | null;
}

interface FormLineItem extends PurchaseLineItem {
    _id: string; // Internal temporary ID for React keys
}

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({ onClose, onSave, purchaseOrder }) => {
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    orderDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    supplierName: '',
    lineItems: [],
    status: 'Pending',
    shippingCost: 0,
    tax: 0,
    notes: ''
  });
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);
  const [activeProductSearch, setActiveProductSearch] = useState<{ index: number; term: string } | null>(null);

  useEffect(() => {
    if (purchaseOrder) {
        setFormData(purchaseOrder);
        setLineItems(purchaseOrder.lineItems.map(item => ({ ...item, _id: crypto.randomUUID() })));
    } else {
        // Init with one empty line
        setLineItems([{ _id: crypto.randomUUID(), productId: '', productName: '', unit: 'pcs', quantity: 1, price: 0 }]);
    }
  }, [purchaseOrder]);

  const { subtotal, grandTotal } = useMemo(() => {
    const sub = lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxAmount = formData.tax || 0;
    const shipping = formData.shippingCost || 0;
    const grand = sub + taxAmount + shipping;
    return { subtotal: sub, grandTotal: grand };
  }, [lineItems, formData.tax, formData.shippingCost]);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedSupplier = MOCK_SUPPLIERS_DATA.find(s => s.id === selectedId);
    setFormData(prev => ({
        ...prev,
        supplierId: selectedId,
        supplierName: selectedSupplier?.name || ''
    }));
  };
  
  const handleItemChange = (index: number, field: keyof FormLineItem, value: any) => {
      const updatedItems = lineItems.map((item, i) => {
          if (i === index) { return { ...item, [field]: value }; }
          return item;
      });
      setLineItems(updatedItems);
  };
  
   const handleProductSelect = (product: Product, index: number) => {
    const items = [...lineItems];
    items[index].productId = product.id;
    items[index].productName = product.name;
    items[index].price = product.costPrice;
    setLineItems(items);
    setActiveProductSearch(null);
  };

  const filteredProducts = useMemo(() => {
    if (!activeProductSearch || !activeProductSearch.term) return [];
    return MOCK_PRODUCTS_DATA.filter(p => p.name.toLowerCase().includes(activeProductSearch.term.toLowerCase()) || p.id.toLowerCase().includes(activeProductSearch.term.toLowerCase()));
  }, [activeProductSearch]);

  const handleProductSearchChange = (index: number, term: string) => {
    setActiveProductSearch({ index, term });
    handleItemChange(index, 'productId', '');
    handleItemChange(index, 'productName', term);
  };
  
  const handleAddItem = () => { setLineItems([...lineItems, { _id: crypto.randomUUID(), productId: '', productName: '', unit: 'pcs', quantity: 1, price: 0 }]); };
  const handleRemoveItem = (index: number) => { if (lineItems.length > 1) { setLineItems(lineItems.filter((_, i) => i !== index)); } };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLineItems = lineItems.map(({ _id, ...rest }) => rest);
    const finalPO = {
        ...formData,
        lineItems: finalLineItems,
        subtotal,
        total: grandTotal,
    };
    onSave(finalPO as PurchaseOrder);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier</label>
          <select value={formData.supplierId} onChange={handleSupplierChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required>
              <option value="">Select a supplier</option>
              {MOCK_SUPPLIERS_DATA.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Order Date</label>
            <input type="date" value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" required />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Expected Delivery Date</label>
            <input type="date" value={formData.expectedDeliveryDate || ''} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Received Date</label>
            <input type="date" value={formData.receivedDate || ''} onChange={e => setFormData({...formData, receivedDate: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div>
             <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as PurchaseOrderStatus})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                {(['Pending', 'Received', 'Partially Received', 'Cancelled'] as PurchaseOrderStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-md font-semibold text-gray-800">Items</h3>
        {lineItems.map((item, index) => (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-start py-2 border-b">
                <div className="col-span-12 md:col-span-5 relative">
                    <input type="text" value={activeProductSearch?.index === index ? activeProductSearch.term : item.productName || item.productId}
                        onChange={(e) => handleProductSearchChange(index, e.target.value)} onFocus={() => handleProductSearchChange(index, item.productName || '')}
                        onBlur={() => setTimeout(() => setActiveProductSearch(null), 200)} placeholder="Search product..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" autoComplete="off"
                    />
                    {activeProductSearch?.index === index && filteredProducts.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {filteredProducts.map(p => ( <li key={p.id} onMouseDown={() => handleProductSelect(p, index)} className="px-3 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm">
                                {p.name} ({p.id})
                            </li>))}
                        </ul>
                    )}
                </div>
                <div className="col-span-4 md:col-span-2"><input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="1"/></div>
                <div className="col-span-4 md:col-span-2"><input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" step="0.01"/></div>
                <div className="col-span-3 md:col-span-2 flex items-center pt-2"><span className="text-sm">${(item.quantity * item.price).toFixed(2)}</span></div>
                <div className="col-span-1 flex items-center justify-end pt-1"><button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500" disabled={lineItems.length <= 1}>&times;</button></div>
            </div>
        ))}
        <button type="button" onClick={handleAddItem} className="mt-2 text-sm font-medium text-primary hover:text-primary-dark">+ Add Item</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center"><label htmlFor="shippingCost" className="text-sm">Shipping Cost</label><input id="shippingCost" type="number" value={formData.shippingCost} onChange={e => setFormData({...formData, shippingCost: Number(e.target.value)})} className="w-24 text-right rounded-md border-gray-300 shadow-sm sm:text-sm" /></div>
            <div className="flex justify-between items-center"><label htmlFor="tax" className="text-sm">Tax</label><input id="tax" type="number" value={formData.tax} onChange={e => setFormData({...formData, tax: Number(e.target.value)})} className="w-24 text-right rounded-md border-gray-300 shadow-sm sm:text-sm" /></div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2"><span >Grand Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>
       <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg mt-4 sticky bottom-0">
          <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">Save Purchase Order</button>
          <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
      </div>
    </form>
  );
};

export default PurchaseOrderForm;