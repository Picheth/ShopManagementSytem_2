import React, { useState, useEffect, useMemo } from 'react';
import { MOCK_PRODUCTS_DATA, MOCK_SUPPLIERS_DATA } from '../src/data/mockData';
import type { Purchase, Product, PurchaseLineItem } from '../types';
import Modal from './Modal';

interface SerialEntryModalProps {
    productName: string;
    quantity: number;
    existingSerials: string[];
    onSave: (serials: string[]) => void;
    onClose: () => void;
}

const SerialEntryModal: React.FC<SerialEntryModalProps> = ({ productName, quantity, existingSerials, onSave, onClose }) => {
    const [serials, setSerials] = useState<string[]>([]);

    useEffect(() => {
        // Initialize with existing serials or empty strings
        const initialSerials = Array.from({ length: quantity }, (_, i) => existingSerials[i] || '');
        setSerials(initialSerials);
    }, [quantity, existingSerials]);

    const handleSerialChange = (index: number, value: string) => {
        const newSerials = [...serials];
        newSerials[index] = value;
        setSerials(newSerials);
    };

    const handleSubmit = () => {
        const filledSerials = serials.filter(s => s.trim() !== '');
        if (filledSerials.length !== quantity) {
            alert(`Please enter exactly ${quantity} serial numbers.`);
            return;
        }
        if (new Set(filledSerials).size !== filledSerials.length) {
            alert('Duplicate serial numbers are not allowed.');
            return;
        }
        onSave(filledSerials);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Enter Serial Numbers for {productName}</h3>
            <p>Please enter/scan the {quantity} unique serial numbers for this item.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2">
                {serials.map((serial, index) => (
                    <div key={index}>
                        <label htmlFor={`serial-${index}`} className="text-sm font-medium text-gray-700">Serial #{index + 1}</label>
                        <input
                            id={`serial-${index}`}
                            type="text"
                            value={serial}
                            onChange={(e) => handleSerialChange(index, e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        />
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button onClick={handleSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">Save Serials</button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
            </div>
        </div>
    );
};

interface PurchaseFormProps {
  onClose: () => void;
  onSave: (purchase: Omit<Purchase, 'id'> | Purchase) => void;
  nextReceivingId: string;
  purchaseToEdit?: Purchase | null;
}

interface FormLineItem extends PurchaseLineItem {
    _id: string; // Internal temporary ID for React keys
}

const SERIALIZED_CATEGORIES: Product['category'][] = ['Phone', 'Tablet', 'Laptop'];

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onClose, onSave, nextReceivingId, purchaseToEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [receivingId, setReceivingId] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [status, setStatus] = useState<Purchase['status']>('Unpaid');
  
  const [lineItems, setLineItems] = useState<FormLineItem[]>([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [otherFees, setOtherFees] = useState(0);
  
  const [activeProductSearch, setActiveProductSearch] = useState<{ index: number; term: string } | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string | { [key: number]: { [key: string]: string } } }>({});
  
  const [isSerialModalOpen, setIsSerialModalOpen] = useState(false);
  const [serialModalIndex, setSerialModalIndex] = useState<number | null>(null);

  // Populate form for editing or reset for new
  useEffect(() => {
    if (purchaseToEdit) {
        const foundSupplier = MOCK_SUPPLIERS_DATA.find(s => s.name === purchaseToEdit.supplier);
        setDate(purchaseToEdit.date);
        setSupplier(purchaseToEdit.supplier);
        setSupplierId(foundSupplier?.id || '');
        setSupplierContact(purchaseToEdit.supplierContact);
        setReceivingId(purchaseToEdit.receivingId);
        setInvoiceId(purchaseToEdit.invoiceId);
        setStatus(purchaseToEdit.status);
        setLineItems(purchaseToEdit.lineItems.map(item => ({...item, _id: crypto.randomUUID()})));
        setShippingCost(purchaseToEdit.shippingCost || 0);
        setOtherFees(purchaseToEdit.otherFees || 0);
    } else {
        // Reset form for "Add New"
        setDate(new Date().toISOString().split('T')[0]);
        setSupplier('');
        setSupplierId('');
        setSupplierContact('');
        setReceivingId(nextReceivingId);
        setInvoiceId('');
        setStatus('Unpaid');
        setLineItems([{ _id: crypto.randomUUID(), productId: '', productName: '', unit: 'pcs', quantity: 1, price: 0, serialNumbers: [] }]);
        setShippingCost(0);
        setOtherFees(0);
    }
  }, [purchaseToEdit, nextReceivingId]);

  const { subtotal, grandTotal } = useMemo(() => {
    const sub = lineItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const grand = sub + shippingCost + otherFees;
    return { subtotal: sub, grandTotal: grand };
  }, [lineItems, shippingCost, otherFees]);


  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setSupplierId(selectedId);
    const selectedSupplier = MOCK_SUPPLIERS_DATA.find(s => s.id === selectedId);
    if (selectedSupplier) {
        setSupplier(selectedSupplier.name);
        if (selectedSupplier.id === 'SUP-GEN') {
            const generatedInvoiceId = `GS-${Date.now()}`;
            setInvoiceId(generatedInvoiceId);
            setSupplierContact('');
        } else {
            setSupplierContact(selectedSupplier.phone);
            if (invoiceId.startsWith('GS-')) setInvoiceId('');
        }
    } else {
        setSupplier('');
        setSupplierContact('');
        setInvoiceId('');
    }
  };

  const filteredProducts = useMemo(() => {
    if (!activeProductSearch || !activeProductSearch.term) return [];
    return MOCK_PRODUCTS_DATA.filter(p => 
        p.id.toLowerCase().includes(activeProductSearch.term.toLowerCase()) || 
        p.name.toLowerCase().includes(activeProductSearch.term.toLowerCase())
    );
  }, [activeProductSearch]);
  
  const handleProductSearchChange = (index: number, term: string) => {
    setActiveProductSearch({ index, term });
    // Clear product info when searching
    handleItemChange(index, 'productId', '');
    handleItemChange(index, 'productName', term);
  };

  const handleProductSelect = (product: Product, index: number) => {
    const items = [...lineItems];
    items[index].productId = product.id;
    items[index].productName = product.name;
    items[index].price = product.costPrice;
    setLineItems(items);
    setActiveProductSearch(null);
  };
  
  const handleAddItem = () => {
    setLineItems([...lineItems, { _id: crypto.randomUUID(), productId: '', productName: '', unit: 'pcs', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length > 1) {
        setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };
  
  const handleItemChange = (index: number, field: keyof FormLineItem, value: any) => {
      const updatedItems = lineItems.map((item, i) => {
          if (i === index) {
              return { ...item, [field]: value };
          }
          return item;
      });
      setLineItems(updatedItems);
  };

  const handleSaveSerials = (serials: string[]) => {
    if (serialModalIndex !== null) {
        handleItemChange(serialModalIndex, 'serialNumbers', serials);
    }
    setIsSerialModalOpen(false);
    setSerialModalIndex(null);
  };

  const validateForm = (): boolean => {
    const newErrors: any = { lineItems: {} };
    if (!date) newErrors.date = 'Date is required.';
    if (!supplierId) newErrors.supplier = 'Supplier is required.';
    if (!invoiceId.trim()) newErrors.invoiceId = 'Supplier Invoice # is required.';
    if (!receivingId.trim()) newErrors.receivingId = 'Receiving Invoice # is required.';
    
    lineItems.forEach((item, index) => {
        if (!item.productId) {
            if (!newErrors.lineItems[index]) newErrors.lineItems[index] = {};
            newErrors.lineItems[index].product = 'Product is required.';
        }
        if (item.quantity <= 0) {
            if (!newErrors.lineItems[index]) newErrors.lineItems[index] = {};
            newErrors.lineItems[index].quantity = 'Must be > 0.';
        }
        if (item.price < 0) {
            if (!newErrors.lineItems[index]) newErrors.lineItems[index] = {};
            newErrors.lineItems[index].price = 'Cannot be negative.';
        }
    });

    if (Object.keys(newErrors.lineItems).length === 0) delete newErrors.lineItems;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        const finalLineItems = lineItems.map(({ _id, ...rest }) => rest);
        // FIX: Added 'amountPaid' to the payload to satisfy the Purchase type, ensuring new purchases have a value of 0.
        const purchasePayload = { receivingId, date, supplier, supplierContact, invoiceId, lineItems: finalLineItems, shippingCost, otherFees, total: grandTotal, status, amountPaid: purchaseToEdit?.amountPaid || 0 };
        
        if (purchaseToEdit) {
            onSave({ ...purchaseToEdit, ...purchasePayload });
        } else {
            onSave(purchasePayload);
        }
    }
  };
  
  const getInputClasses = (fieldName: string) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors[fieldName] ? 'border-red-500' : ''}`;
  const getLineItemInputClasses = (index: number, fieldName: string) => `block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${(errors.lineItems as any)?.[index]?.[fieldName] ? 'border-red-500' : ''}`;

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Supplier and Invoice Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className={getInputClasses('date')} required />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date as string}</p>}
        </div>
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">Supplier</label>
          <select id="supplier" value={supplierId} onChange={handleSupplierChange} className={getInputClasses('supplier')} required>
              <option value="">Select a supplier</option>
              {MOCK_SUPPLIERS_DATA.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.supplier && <p className="text-red-500 text-xs mt-1">{errors.supplier as string}</p>}
        </div>
      </div>
       <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="receivingId" className="block text-sm font-medium text-gray-700">Receiving Invoice #</label>
            <input type="text" id="receivingId" value={receivingId} onChange={(e) => setReceivingId(e.target.value)} placeholder="e.g., RO-00001" className={getInputClasses('receivingId')} required />
            {errors.receivingId && <p className="text-red-500 text-xs mt-1">{errors.receivingId as string}</p>}
        </div>
        <div>
          <label htmlFor="invoiceId" className="block text-sm font-medium text-gray-700">Supplier Invoice #</label>
          <input type="text" id="invoiceId" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} placeholder="INV-A123" className={`${getInputClasses('invoiceId')} ${supplierId === 'SUP-GEN' ? 'bg-gray-100' : ''}`} readOnly={supplierId === 'SUP-GEN'} required />
          {errors.invoiceId && <p className="text-red-500 text-xs mt-1">{errors.invoiceId as string}</p>}
        </div>
       </div>
      
      {/* Item Details Table */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <h3 className="text-md font-semibold text-gray-800">Items</h3>
        {/* Table Headers */}
        <div className="hidden md:grid grid-cols-12 gap-x-2 text-xs font-medium text-gray-500">
            <div className="col-span-5">Product</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1"></div>
        </div>
        {lineItems.map((item, index) => {
            const product = MOCK_PRODUCTS_DATA.find(p => p.id === item.productId);
            const isSerialized = product && SERIALIZED_CATEGORIES.includes(product.category);

            return (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-12 md:col-span-5 relative">
                    <label className="text-xs font-medium text-gray-500 md:hidden">Product</label>
                    <input
                        type="text"
                        value={activeProductSearch?.index === index ? activeProductSearch.term : item.productName || item.productId}
                        onChange={(e) => handleProductSearchChange(index, e.target.value)}
                        onFocus={() => handleProductSearchChange(index, item.productId || '')}
                        onBlur={() => setTimeout(() => setActiveProductSearch(null), 200)}
                        placeholder="SKU or Name"
                        className={getLineItemInputClasses(index, 'product')}
                        autoComplete="off"
                    />
                    {activeProductSearch?.index === index && filteredProducts.length > 0 && (
                        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {filteredProducts.map(p => (
                                <li key={p.id} onMouseDown={() => handleProductSelect(p, index)} className="px-3 py-2 hover:bg-primary hover:text-white cursor-pointer text-sm">
                                    <div className="font-medium">{p.id}</div>
                                    <div className="text-xs">{p.name}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {(errors.lineItems as any)?.[index]?.product && <p className="text-red-500 text-xs mt-1">{(errors.lineItems as any)[index].product}</p>}
                    {isSerialized && (
                      <button type="button" onClick={() => { setSerialModalIndex(index); setIsSerialModalOpen(true); }} className="text-xs text-primary hover:underline mt-1">
                          {item.serialNumbers?.length === item.quantity ? `View/Edit ${item.quantity} Serials` : `Enter ${item.quantity} Serials`}
                      </button>
                    )}
                </div>
                <div className="col-span-4 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 md:hidden">Quantity</label>
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className={getLineItemInputClasses(index, 'quantity')} min="1" />
                </div>
                <div className="col-span-4 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 md:hidden">Unit</label>
                    <input type="text" value={item.unit} onChange={e => handleItemChange(index, 'unit', e.target.value)} className={getLineItemInputClasses(index, 'unit')} />
                </div>
                <div className="col-span-4 md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 md:hidden">Unit Price</label>
                    <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className={getLineItemInputClasses(index, 'price')} min="0" step="0.01" />
                </div>
                <div className="col-span-12 md:col-span-1 flex items-end justify-end pt-2 md:pt-0">
                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 disabled:opacity-50" disabled={lineItems.length <= 1}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            );
        })}
        <button type="button" onClick={handleAddItem} className="mt-2 text-sm font-medium text-primary hover:text-primary-dark">+ Add another line</button>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div>
            {/* Future fields if needed */}
        </div>
        <div className="space-y-2">
            <div className="flex justify-between items-center"><span className="text-sm">Subtotal</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between items-center">
                <label htmlFor="shippingCost" className="text-sm">Shipping Cost</label>
                <input id="shippingCost" type="number" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))} className="w-24 text-right rounded-md border-gray-300 shadow-sm sm:text-sm" />
            </div>
             <div className="flex justify-between items-center">
                <label htmlFor="otherFees" className="text-sm">Other Fees</label>
                <input id="otherFees" type="number" value={otherFees} onChange={e => setOtherFees(Number(e.target.value))} className="w-24 text-right rounded-md border-gray-300 shadow-sm sm:text-sm" />
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2"><span >Grand Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span></div>
        </div>
      </div>
      
      <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">{purchaseToEdit ? 'Save Changes' : 'Save Purchase'}</button>
        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
      </div>
    </form>
     {isSerialModalOpen && serialModalIndex !== null && lineItems[serialModalIndex] && (
        <Modal isOpen={isSerialModalOpen} onClose={() => setIsSerialModalOpen(false)} title="Enter Serial Numbers">
            <SerialEntryModal
                productName={lineItems[serialModalIndex].productName}
                quantity={lineItems[serialModalIndex].quantity}
                existingSerials={lineItems[serialModalIndex].serialNumbers || []}
                onSave={handleSaveSerials}
                onClose={() => setIsSerialModalOpen(false)}
            />
        </Modal>
    )}
    </>
  );
};

// FIX: Add default export to make the component importable.
export default PurchaseForm;