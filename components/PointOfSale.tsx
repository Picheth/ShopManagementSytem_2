
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_PRODUCTS_DATA, MOCK_TAX_RATES_DATA, MOCK_SALES_DATA, MOCK_INSTALLMENT_PLANS_DATA, MOCK_INSTALLMENTS_DATA } from '../data/mockData';
import type { Product, SaleLineItem, Sale, InstallmentPlan, Installment } from '../types';
import PaymentModal from './PaymentModal';

interface CartItem extends SaleLineItem {
    _id: string; // Temporary ID for React keys
}

const PointOfSale: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS_DATA);
    const [sales, setSales] = useState<Sale[]>(MOCK_SALES_DATA);
    const [installmentPlans, setInstallmentPlans] = useState<InstallmentPlan[]>(MOCK_INSTALLMENT_PLANS_DATA);
    const [installments, setInstallments] = useState<Installment[]>(MOCK_INSTALLMENTS_DATA);
    
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerName, setCustomerName] = useState('Walk-in Customer');
    const [invoiceType, setInvoiceType] = useState<'Tax Invoice' | 'Invoice'>('Tax Invoice');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const defaultTaxRate = useMemo(() => MOCK_TAX_RATES_DATA.find(r => r.isDefault) || MOCK_TAX_RATES_DATA[0], []);

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            updateQuantity(existingItem._id, 1);
        } else {
            setCart([...cart, {
                _id: crypto.randomUUID(),
                productId: product.id,
                productName: product.name,
                quantity: 1,
                price: product.price
            }]);
        }
    };

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item._id === itemId) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeFromCart = (itemId: string) => {
        setCart(cart.filter(item => item._id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
        setCustomerName('Walk-in Customer');
    };
    
    const handleSaleFinalized = (newSale: Sale, newPlan?: InstallmentPlan, newInstallments?: Installment[]) => {
        // This is where we would update persistent stock. For now, we update in-memory state.
        const newProducts = [...products];
        newSale.lineItems.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.productId);
            if (productIndex !== -1 && newProducts[productIndex].stock >= item.quantity) {
                newProducts[productIndex].stock -= item.quantity;
            }
        });
        setProducts(newProducts);
        setSales(prev => [newSale, ...prev]);
        if(newPlan) setInstallmentPlans(prev => [newPlan, ...prev]);
        if(newInstallments) setInstallments(prev => [...newInstallments, ...prev]);

        clearCart();
    };

    const { subtotal, taxAmount, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        if (invoiceType === 'Invoice') {
            return { subtotal: sub, taxAmount: 0, total: sub };
        }

        const tax = sub * (defaultTaxRate.rate / 100);
        return { subtotal: sub, taxAmount: tax, total: sub + tax };
    }, [cart, defaultTaxRate, invoiceType]);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [products, searchTerm]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-7rem)]">
                {/* Left Panel: Product Selection */}
                <div className="flex flex-col bg-card rounded-lg shadow h-full">
                    <div className="p-4 border-b">
                        <input
                            type="text"
                            placeholder="Search products by name or SKU..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <button key={product.id} onClick={() => addToCart(product)} className="border rounded-lg p-2 text-center hover:bg-primary/10 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                                    <p className="text-sm font-semibold text-text-main truncate">{product.name}</p>
                                    <p className="text-xs text-text-light">{product.id}</p>
                                    <p className="text-md font-bold text-primary mt-2">${product.price.toFixed(2)}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Cart */}
                <div className="flex flex-col bg-card rounded-lg shadow h-full">
                    <div className="p-4 border-b">
                        <div className="flex rounded-lg border p-1 bg-gray-100">
                            <button
                                onClick={() => setInvoiceType('Tax Invoice')}
                                className={`w-1/2 rounded-md py-2 text-sm font-semibold transition-colors ${
                                    invoiceType === 'Tax Invoice'
                                        ? 'bg-white shadow text-primary'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Tax Invoice
                            </button>
                            <button
                                onClick={() => setInvoiceType('Invoice')}
                                className={`w-1/2 rounded-md py-2 text-sm font-semibold transition-colors ${
                                    invoiceType === 'Invoice'
                                        ? 'bg-white shadow text-primary'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Invoice
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border-b">
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {cart.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-text-light">
                                <p>Cart is empty</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {cart.map(item => (
                                    <div key={item._id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-text-main">{item.productName}</p>
                                            <p className="text-sm text-text-light">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQuantity(item._id, -1)} className="w-7 h-7 bg-gray-200 rounded-full text-lg font-bold">-</button>
                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item._id, 1)} className="w-7 h-7 bg-gray-200 rounded-full text-lg font-bold">+</button>
                                            <button onClick={() => removeFromCart(item._id)} className="ml-2 text-red-500 hover:text-red-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t space-y-2">
                        <div className="flex justify-between">
                            <span className="text-text-light">{invoiceType === 'Tax Invoice' ? 'Exclude-Tax Total' : 'Subtotal'}</span>
                            <span className="font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        {invoiceType === 'Tax Invoice' && (
                            <div className="flex justify-between">
                                <span className="text-text-light">Tax ({defaultTaxRate.rate}%)</span>
                                <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-2xl font-bold text-primary pt-2 border-t"><span >Total</span><span>${total.toFixed(2)}</span></div>
                    </div>
                    <div className="p-4 flex gap-4">
                        <button onClick={clearCart} className="w-1/3 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">Clear</button>
                        <button onClick={() => setIsPaymentModalOpen(true)} disabled={cart.length === 0} className="w-2/3 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">Pay</button>
                    </div>
                </div>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                cartItems={cart.map(({_id, ...rest}) => rest)}
                customerName={customerName}
                subtotal={subtotal}
                taxAmount={taxAmount}
                taxRateId={defaultTaxRate.id}
                total={total}
                invoiceType={invoiceType}
                // FIX: Corrected prop type mismatch by passing handleSaleFinalized directly (as its signature is compatible) and adding the missing 'allSales' prop.
                onSaleFinalized={handleSaleFinalized}
                allSales={sales}
            />
        </>
    );
};

export default PointOfSale;
