
import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS_DATA, MOCK_TAX_RATES_DATA } from '../src/data/mockData';
import type { Product, SaleLineItem, Sale, TaxRate, SerializedItem } from '../types';
import Modal from './Modal';
import SerialSelectorModal from './SerialSelectorModal';

interface SaleFormProps {
  onClose: () => void;
  onSave: (sale: Omit<Sale, 'id' | 'orderId' | 'saleInvoiceId'> | Sale) => void;
  saleToEdit?: Sale | null;
}

interface FormLineItem extends SaleLineItem {
    _id: string; // Internal temporary ID for React keys
}

interface SaleFormErrors {
    date?: string;
    customer?: string;
    dueDate?: string;
    lineItems?: {
        [index: number]: {
            product?: string;
            quantity?: string;
            price?: string;
            serial?: string;
        }
    };
    form?: string;
}

const SERIALIZED_CATEGORIES: Product['category'][] = ['Phone', 'Tablet', 'Laptop'];

const SaleForm: React.FC<SaleFormProps> = ({ onClose, onSave, saleToEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState<Sale['status']>('Unpaid');
  const [dueDate, setDueDate] = useState('');
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);
  const [taxRateId, setTaxRateId] = useState<string>('TAX001');
  const [activeProductSearch, setActiveProductSearch] = useState<{ index: number; term: string } | null>(null);
  const [errors, setErrors] = useState<SaleFormErrors>({});
  
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [serialModalLineIndex, setSerialModalLineIndex] = useState<number | null>(null);

  useEffect(() => {
    const defaultTaxId = MOCK_TAX_RATES_DATA.find(r => r.isDefault)?.id || 'TAX001';
    if (saleToEdit) {
        setDate(saleToEdit.date);
        setCustomer(saleToEdit.customer);
        setStatus(saleToEdit.status);
        setDueDate(saleToEdit.dueDate || '');
        setLineItems(saleToEdit.lineItems.map(li => ({ ...li, _id: crypto.randomUUID() })));
        setTaxRateId(saleToEdit.taxRateId || defaultTaxId);
    } else {
        setDate(new Date().toISOString().split('T')[0]);
        setCustomer('');
        setStatus('Unpaid');
        setDueDate('');
        setLineItems([{ _id: crypto.randomUUID(), productId: '', productName: '', quantity: 1, price: 0 }]);
        setTaxRateId(defaultTaxId);
    }
  }, [saleToEdit]);

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  }, [lineItems]);
  
  const { taxAmount, grandTotal } = useMemo(() => {
    const selectedRate = MOCK_TAX_RATES_DATA.find(rate => rate.id === taxRateId);
    const rate = selectedRate ? selectedRate.rate / 100 : 0;
    const tax = subtotal * rate;
    return { taxAmount: tax, grandTotal: subtotal + tax };
  }, [subtotal, taxRateId]);
  
  const handleAddItem = () => {
    setLineItems([...lineItems, { _id: crypto.randomUUID(), productId: '', productName: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length > 1) {
        setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  
  const handleItemChange = (index: number, field: keyof Omit<FormLineItem, '_id'>, value: any) => {
      const updatedItems = lineItems.map((item, i) => {
          if (i === index) { return { ...item, [field]: value }; }
          return item;
      });
      setLineItems(updatedItems);
  };
  
  const filteredProducts = useMemo(() => {
    if (!activeProductSearch || !activeProductSearch.term) return [];
    return MOCK_PRODUCTS_DATA.filter(p => p.id.toLowerCase().includes(activeProductSearch.term.toLowerCase()) || p.name.toLowerCase().includes(activeProductSearch.term.toLowerCase()));
  }, [activeProductSearch]);
  
  const handleProductSearchChange = (index: number, term: string) => {
    setActiveProductSearch({ index, term });
    handleItemChange(index, 'productId', '');
    handleItemChange(index, 'productName', term);
    handleItemChange(index, 'serialNumber', undefined);
    handleItemChange(index, 'serializedItemId', undefined);
  };

  const handleProductSelect = (product: Product, index: number) => {
    const items = [...lineItems];
    items[index].productId = product.id;
    items[index].productName = product.name;
    items[index].price = product.price;
    
    // If serialized, force quantity to 1
    if (SERIALIZED_CATEGORIES.includes(product.category)) {
        items[index].quantity = 1;
    }

    setLineItems(items);
    setActiveProductSearch(null);
  };

  const handleSelectSerial = (item: SerializedItem) => {
    if (serialModalLineIndex !== null) {
        handleItemChange(serialModalLineIndex, 'serialNumber', item.serialNumber);
        handleItemChange(serialModalLineIndex, 'serializedItemId', item.id);
    }
    setIsSerialModalOpen(false);
    setSerialModalLineIndex(null);
  };

  const validateForm = (): boolean => {
    const newErrors: SaleFormErrors = {};
    if (!date) { newErrors.date = 'Date is required.'; }
    if (!customer.trim()) { newErrors.customer = 'Customer name is required.'; }
    // FIX: Simplified the logic to check if status is not 'Paid' to require a due date. This resolves the linter error while maintaining the same logic.
    if (status !== 'Paid' && !dueDate) { newErrors.dueDate = 'Due date is required for unpaid invoices.'; }

    const lineItemErrors: SaleFormErrors['lineItems'] = {};
    let hasLineItemErrors = false;
    lineItems.forEach((item, index) => {
        const itemErrors: { product?: string; quantity?: string; price?: string; serial?: string; } = {};
        if (!item.productId) { itemErrors.product = 'A product must be selected.'; hasLineItemErrors = true; }
        if (!item.quantity || item.quantity <= 0) { itemErrors.quantity = 'Quantity must be > 0.'; hasLineItemErrors = true; }
        
        const product = MOCK_PRODUCTS_DATA.find(p => p.id === item.productId);
        if (product && SERIALIZED_CATEGORIES.includes(product.category) && !item.serializedItemId) {
            itemErrors.serial = 'A serial number must be selected.';
            hasLineItemErrors = true;
        }

        if (Object.keys(itemErrors).length > 0) { lineItemErrors![index] = itemErrors; }
    });

    if (hasLineItemErrors) { newErrors.lineItems = lineItemErrors; }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        const finalLineItems = lineItems.map(({ _id, ...rest }) => rest);
        
        let salePayload: Omit<Sale, 'id' | 'orderId' | 'saleInvoiceId'> = {
            date,
            customer,
            lineItems: finalLineItems,
            subtotal,
            taxRateId,
            taxAmount,
            total: grandTotal,
            status,
            amountPaid: saleToEdit?.amountPaid || 0,
        };

        if ((status as string) === 'Paid') {
            salePayload.amountPaid = salePayload.total;
        } else {
            (salePayload as Sale).dueDate = dueDate;
        }

        if (saleToEdit) {
            const updatedSale = { ...saleToEdit, ...salePayload };
            if ((status as string) === 'Paid') {
                delete updatedSale.dueDate;
            }
            onSave(updatedSale);
        } else {
            onSave(salePayload);
        }
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Form fields... */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.date ? 'border-red-500' : ''}`} required />
        </div>
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input type="text" id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.customer ? 'border-red-500' : ''}`} placeholder="John Doe" required />
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <h3 className="text-md font-semibold text-gray-800">Items</h3>
        {lineItems.map((item, index) => {
            const product = MOCK_PRODUCTS_DATA.find(p => p.id === item.productId);
            const isSerialized = product && SERIALIZED_CATEGORIES.includes(product.category);
            const serialError = errors.lineItems?.[index]?.serial;
            return (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-5 relative">
                    <input type="text" value={activeProductSearch?.index === index ? activeProductSearch.term : item.productName || item.productId} onChange={(e) => handleProductSearchChange(index, e.target.value)} onFocus={() => handleProductSearchChange(index, item.productName || '')} onBlur={() => setTimeout(() => setActiveProductSearch(null), 200)} placeholder="Search by SKU or Name" className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.lineItems?.[index]?.product ? 'border-red-500' : ''}`} autoComplete="off" />
                    {activeProductSearch?.index === index && filteredProducts.length > 0 && ( <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg"> {filteredProducts.map(p => ( <li key={p.id} onMouseDown={() => handleProductSelect(p, index)} className="px-3 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm"> <div className="font-medium">{p.name}</div> <div className="text-xs text-text-light">SKU: {p.id} | Stock: {p.stock}</div> </li> ))} </ul> )}
                    {isSerialized && (
                        <div className="mt-1">
                            {item.serialNumber ? (
                                <div className="flex items-center justify-between text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1">
                                    <span className="font-mono text-blue-800">{item.serialNumber}</span>
                                    <button type="button" onClick={() => { setSerialModalLineIndex(index); setIsSerialModalOpen(true); }} className="text-blue-600 hover:underline ml-2">Change</button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => { setSerialModalLineIndex(index); setIsSerialModalOpen(true); }} className={`w-full text-left text-sm p-2 rounded border ${serialError ? 'bg-red-50 border-red-400 text-red-700' : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'}`}>Select Serial Number</button>
                            )}
                            {serialError && <p className="text-red-500 text-xs mt-1">{serialError}</p>}
                        </div>
                    )}
                </div>
                 <div className="col-span-4 md:col-span-2">
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${isSerialized ? 'bg-gray-100' : ''}`} min="1" readOnly={isSerialized} />
                </div>
                 <div className="col-span-4 md:col-span-2">
                    <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" min="0" step="0.01" />
                </div>
                <div className="col-span-4 md:col-span-2 flex items-center pt-2 md:pt-0"><span className="text-sm text-gray-800">${(item.quantity * item.price).toFixed(2)}</span></div>
                <div className="col-span-12 md:col-span-1 flex items-end justify-end pt-2 md:pt-0"><button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 disabled:opacity-50" disabled={lineItems.length <= 1}> <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> </button> </div>
            </div>
            );
        })}
        <button type="button" onClick={handleAddItem} className="mt-2 text-sm font-medium text-primary hover:text-primary-dark">+ Add another line</button>
      </div>

       <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Payment Status</label>
              <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Sale['status'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                  <option value="Unpaid">Unpaid</option> <option value="Partially Paid">Partially Paid</option> <option value="Paid">Paid</option> <option value="Overdue">Overdue</option>
              </select>
            </div>
             {(status !== 'Paid') && ( <div> <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label> <input type="date" id="dueDate" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors.dueDate ? 'border-red-500' : ''}`} required /> </div> )}
            <div className="col-span-2">
                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate</label>
                <select id="taxRate" value={taxRateId} onChange={(e) => setTaxRateId(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                    {MOCK_TAX_RATES_DATA.map(rate => ( <option key={rate.id} value={rate.id}>{rate.name} ({rate.rate}%)</option>))}
                </select>
            </div>
        </div>
        <div className="space-y-2 flex flex-col justify-end">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><span>{taxAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
            <div className="flex items-center justify-between font-bold text-lg pt-2 border-t"><span>Grand Total</span><span>{grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></div>
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">{saleToEdit ? 'Save Changes' : 'Save Sale'}</button>
        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
      </div>
    </form>
    {serialModalLineIndex !== null && lineItems[serialModalLineIndex] && (
        <Modal isOpen={isSerialModalOpen} onClose={() => setIsSerialModalOpen(false)} title="Select Serial Number">
            <SerialSelectorModal
                productId={lineItems[serialModalLineIndex].productId}
                onClose={() => setIsSerialModalOpen(false)}
                onSelect={handleSelectSerial}
                excludedSerials={lineItems.map(i => i.serialNumber).filter(Boolean) as string[]}
            />
        </Modal>
    )}
    </>
  );
};

export default SaleForm;
