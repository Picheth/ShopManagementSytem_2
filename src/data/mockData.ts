
import type { InventoryItem, Product, Purchase, Branch, StockTransfer, Expense, Settlement, Supplier, CashFlowActivity, Contact, TaxRate, Sale, Payment, SerializedItem, Account, User, RepairJob, PurchaseOrder, VariationAttribute, MonthlyTaxPayment, Installment, InstallmentPlan, ProductMaster, ProductVariation } from '../../types';
import React from 'react';

// From data/variationsData.ts
export const MOCK_VARIATIONS_DATA: VariationAttribute[] = [
    { id: 'ram', name: 'RAM', values: ['4GB', '6GB', '8GB', '12GB', '16GB', '18GB', '24GB', '32GB', '64GB', '128GB'] },
    { id: 'storage', name: 'Storage', values: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '3TB', '4TB', '8TB', '10000mAh', '20000mAh', '30000mAh', 'N/A'] },
    { id: 'color', name: 'Color', values: [
        'Alpine Green', 'Black', 'Black Titanium', 'Blue', 'Blue Titanium', 
        'Bora Purple', 'Burgundy', 'Cloud White', 'Cosmic Orange', 'Cream', 
        'Deep Blue', 'Deep Purple', 'Desert Titanium', 'Gold', 'Graphite', 
        'Gray', 'Green', 'Jet Black', 'Lavender', 'Light Gold', 'Lime', 
        'Matte Gold', 'Matte Midnight Green', 'Matte Silver', 'Matte Space Gray', 
        'Midnight', 'Mist Blue', 'N/A', 'Natural Titanium', 'Navy', 'Olive', 
        'Pacific Blue', 'Phantom Black', 'Phantom Brown', 'Phantom Navy', 
        'Phantom Silver', 'Phantom Titanium', 'Pink', 'Pink Gold', 'Purple', 
        'Red', 'Rose Gold', 'Sage', 'Sierra Blue', 'Silver', 'Sky Blue', 
        'Space Black', 'Space Gray', 'Starlight', 'Teal', 'Ultramarine', 
        'Violet', 'White', 'White Titanium', 'Yellow'
    ] },
    { id: 'generation', name: 'Generation', values: ['1st Gen','2nd Gen','3rd Gen', '4th Gen', '5th Gen', '6th Gen', '7th Gen', '8th Gen', '9th Gen', '10th Gen', '11th Gen', '12th Gen'] },
    { id: 'modelCode', name: 'Model Code', values: [] },
    { id: 'yearReleased', name: 'Year Released', values: ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'] },
    { id: 'country', name: 'Region/Country', values: ['B', 'B/DS', 'BA', 'CA', 'CH', 'E', 'E/DS', 'G', 'JA', 'JP', 'KH', 'KO', 'LL', 'N', 'N/A', 'U', 'U1', 'US', 'W', 'XA', 'ZA', 'ZP'] },
    { id: 'condition', name: 'Condition', values: ['NEW', 'NEW N/A', 'NEW ACT', 'NEW NoBox', 'USED', 'AUSED', 'UnknownPart','ApplePart', 'Activated', 'PartReplace', 'Others'] },
];

// From data/staffData.ts
export const MOCK_STAFF_DATA: User[] = [
    { id: 'USR001', name: 'Admin User', email: 'admin@phonestore.com', role: 'Admin', status: 'Active', branchId: 'B001' },
    { id: 'USR002', name: 'Alice Johnson', email: 'alice.j@phonestore.com', role: 'Manager', status: 'Active', branchId: 'B001' },
    { id: 'USR003', name: 'Bob Williams', email: 'bob.w@phonestore.com', role: 'Manager', status: 'Inactive', branchId: 'B002' },
    { id: 'USR004', name: 'Charlie Brown', email: 'charlie.b@phonestore.com', role: 'Technician', status: 'Active', branchId: 'B003' },
    { id: 'USR005', name: 'Diana Prince', email: 'diana.p@phonestore.com', role: 'Sales Staff', status: 'Active', branchId: 'B004' },
    { id: 'USR006', name: 'Edward Nygma', email: 'ed.n@phonestore.com', role: 'Sales Staff', status: 'Active', branchId: 'B001' },
];

// From data/repairsData.ts
export const MOCK_REPAIRS_DATA: RepairJob[] = [
  { 
    id: 'REP-00001', 
    customerName: 'John Doe', 
    customerPhone: '555-0101', 
    deviceModel: 'iPhone 13 Pro', 
    deviceImei: '353987101234567', 
    reportedIssue: 'Cracked screen', 
    technicianId: 'USR004', 
    status: 'Completed', 
    receivedDate: '2023-10-20', 
    estimatedCompletionDate: '2023-10-21', 
    cost: 249.99, 
    notes: 'Replaced front glass assembly.' 
  },
  { 
    id: 'REP-00002', 
    customerName: 'Jane Smith', 
    customerPhone: '555-0102', 
    deviceModel: 'Samsung Galaxy S22', 
    deviceImei: '358912345678901', 
    reportedIssue: 'Battery not holding charge.', 
    technicianId: 'USR004', 
    status: 'Ready for Pickup', 
    receivedDate: '2023-10-22', 
    estimatedCompletionDate: '2023-10-23', 
    cost: 89.99, 
    notes: 'Replaced battery with new OEM part.' 
  },
];

// From data/purchaseOrdersData.ts
export const MOCK_PURCHASE_ORDERS_DATA: PurchaseOrder[] = [
    {
        id: 'PO-00001',
        orderDate: '2023-10-28',
        expectedDeliveryDate: '2023-11-05',
        supplierId: 'SUP001',
        supplierName: 'Apple Inc.',
        lineItems: [
            { productId: 'PV-001', productName: 'Apple iPhone 15 Pro 256GB Black US NEW', unit: 'pcs', quantity: 20, price: 990 },
            { productId: 'PV-002', productName: 'Apple iPhone 14 128GB Starlight LL NEW', unit: 'pcs', quantity: 30, price: 640 },
        ],
        subtotal: (20 * 990) + (30 * 640),
        tax: ((20 * 990) + (30 * 640)) * 0.08,
        shippingCost: 150,
        total: ((20 * 990) + (30 * 640)) * 1.08 + 150,
        status: 'Pending',
        notes: 'Urgent order for holiday stock.'
    },
];

// From data/monthlyTaxPaymentsData.ts
export const MOCK_MONTHLY_TAX_PAYMENTS_DATA: MonthlyTaxPayment[] = [
  { id: 'MTP-001', paymentDate: '2023-10-15', amountPaid: 1080800, paymentMethod: 'Bank Transfer', status: 'Paid', referenceId: 'FT-231015-AB123', notes: 'October 2023 Monthly Tax' },
];

// From data/expenseCategoriesData.ts
export interface ExpenseCategoryGroup {
  id: string;
  name: string;
  icon: React.ReactNode;
  subcategories: string[];
}

export const MOCK_EXPENSE_CATEGORIES_DATA: ExpenseCategoryGroup[] = [
    { id: 'inventory', name: 'Inventory & Product Costs', icon: null, subcategories: ['Purchase of smartphones', 'Accessories'] },
    { id: 'rent', name: 'Rent & Utilities', icon: null, subcategories: ['Shop rent', 'Electricity', 'Water', 'Internet'] },
];

// From data/chartOfAccountsData.ts
export const MOCK_ACCOUNTS_DATA: Account[] = [
  // Assets
  { id: '1010', name: 'Cash on Hand', type: 'Asset', subType: 'Current Asset', balance: 1250.75, description: 'Physical cash in the register.' },
  { id: '1200', name: 'Accounts Receivable', type: 'Asset', subType: 'Current Asset', balance: 2150.00, description: 'Money owed by customers.' },
  { id: '2000', name: 'Accounts Payable', type: 'Liability', subType: 'Current Liability', balance: 14245.00, description: 'Money owed to suppliers.' },
  { id: '4000', name: 'Product Sales Revenue', type: 'Revenue', subType: 'Sales', balance: 350200.00, description: 'Revenue from selling phones and accessories.' },
  { id: '5000', name: 'Cost of Goods Sold (COGS)', type: 'Expense', subType: 'Direct Costs', balance: 210120.00, description: 'Cost of inventory sold.' },
];

export const MOCK_SERIALIZED_ITEMS_DATA: SerializedItem[] = [
    { id: 'SER001', serialNumber: 'SN-A1B2C3D4E1', productId: 'PV-001', purchaseId: 'P001', status: 'In Stock', costPrice: 999, locationId: 'B001', dateAdded: '2023-10-26' },
    { id: 'SER002', serialNumber: 'SN-A1B2C3D4E2', productId: 'PV-001', purchaseId: 'P001', status: 'In Stock', costPrice: 999, locationId: 'B001', dateAdded: '2023-10-26' },
];


export const MOCK_PAYMENTS_DATA: Payment[] = [
    { id: 'PAY-S001', transactionId: 'PAY-00001', referenceId: 'SA002', type: 'sale', date: '2023-10-28', amount: 500, method: 'Bank Transfer', notes: 'Initial deposit.' },
];

export const MOCK_INSTALLMENT_PLANS_DATA: InstallmentPlan[] = [
    {
        id: 'PLAN-00001',
        saleId: 'SA002', 
        totalAmount: 1299,
        downPayment: 500,
        loanAmount: 799,
        interestRate: 12,
        termMonths: 6,
        monthlyPayment: 137.45,
        startDate: '2023-10-27',
        status: 'Active',
    }
];

export const MOCK_INSTALLMENTS_DATA: Installment[] = [
    { id: 'INST-00001', planId: 'PLAN-00001', installmentNumber: 1, dueDate: '2023-11-27', amountDue: 137.45, amountPaid: 137.45, status: 'Paid', paymentDate: '2023-11-25' },
];


export const MOCK_SALES_DATA: Sale[] = [
  { id: 'SA001', orderId: 'OR-00001', saleInvoiceId: 'SA-00001', date: '2023-10-28', customer: 'John Doe', lineItems: [{ productId: 'PV-001', productName: 'Apple iPhone 15 Pro 256GB Black US NEW', quantity: 1, price: 1199, serialNumber: 'SN-A1B2C3D4E3' }], subtotal: 1199, taxRateId: 'TAX003', taxAmount: 119.9, total: 1318.9, amountPaid: 1318.9, status: 'Paid', invoiceType: 'Tax Invoice' },
];

export const MOCK_PURCHASES_DATA: Purchase[] = [
  { id: 'P001', purchaseId: 'PO-20231026-0001', receivingId: 'RO-00001', date: '2023-10-26', supplier: 'Apple Inc.', supplierContact: '800-275-2273', invoiceId: 'APL-INV-5829', lineItems: [{ productId: 'PV-001', productName: 'iPhone 15 Pro', unit: 'pcs', quantity: 10, price: 999, serialNumbers: ['SN-A1B2C3D4E1', 'SN-A1B2C3D4E2'] }], total: 9990, amountPaid: 9990, status: 'Paid' },
];


export const MOCK_SUPPLIERS_DATA: Supplier[] = [
  { id: 'SUP001', name: 'Apple Inc.', contactPerson: 'Tim Cook', email: 'sales@apple.com', phone: '800-275-2273', category: 'Electronics', totalSpent: 9990 },
  { id: 'SUP002', name: 'Samsung Electronics', contactPerson: 'Jane Lee', email: 'orders@samsung.com', phone: '800-726-7864', category: 'Electronics', totalSpent: 5495 },
];

export const MOCK_PRODUCT_MASTERS: ProductMaster[] = [
    { id: 'PM-001', name: 'iPhone 15 Pro', brand: 'Apple', model: 'iPhone 15 Pro', category: 'Phone', description: 'Apple flagship phone 2023' },
    { id: 'PM-002', name: 'iPhone 14', brand: 'Apple', model: 'iPhone 14', category: 'Phone', description: 'Standard model 2022' },
    { id: 'PM-003', name: 'Galaxy S23 Ultra', brand: 'Samsung', model: 'Galaxy S23 Ultra', category: 'Phone', description: 'Samsung flagship 2023' },
    { id: 'PM-004', name: 'iPhone 15', brand: 'Apple', model: 'iPhone 15', category: 'Phone', description: 'Standard 2023 model' },
];

export const MOCK_PRODUCT_VARIATIONS: ProductVariation[] = [
    { 
        id: 'PV-001', 
        productId: 'PM-001', 
        sku: 'IP15P-256-BLK-US-NEW', 
        attributes: { storage: '256GB', color: 'Black Titanium', country: 'US', condition: 'NEW' }, 
        price: 1199, 
        costPrice: 999, 
        stock: 25,
        shortModel: 'IP15P',
        subCategory: 'Goods for Sale'
    },
    { 
        id: 'PV-002', 
        productId: 'PM-002', 
        sku: 'IP14-128-STL-LL-NEW', 
        attributes: { storage: '128GB', color: 'Starlight', country: 'LL', condition: 'NEW' }, 
        price: 799, 
        costPrice: 650, 
        stock: 40,
        shortModel: 'IP14',
        subCategory: 'Goods for Sale' 
    },
    { 
        id: 'PV-003', 
        productId: 'PM-003', 
        sku: 'GS23U-512-WHT-KO-NEW', 
        attributes: { storage: '512GB', color: 'White', country: 'KO', condition: 'NEW' }, 
        price: 1299, 
        costPrice: 1099, 
        stock: 15,
        shortModel: 'GS23U',
        subCategory: 'Goods for Sale'
    },
    { 
        id: 'PV-004', 
        productId: 'PM-004', 
        sku: 'IP15-128-BLK-US-NEW', 
        attributes: { storage: '128GB', color: 'Black', country: 'US', condition: 'NEW' }, 
        price: 999, 
        costPrice: 800, 
        stock: 50, 
        shortModel: 'IP15', 
        subCategory: 'Goods for Sale' 
    },
];

// Helper to flatten for legacy support
const flattenProducts = (): Product[] => {
    return MOCK_PRODUCT_VARIATIONS.map(v => {
        const master = MOCK_PRODUCT_MASTERS.find(m => m.id === v.productId);
        // Construct a descriptive name
        const variationName = `${Object.values(v.attributes).filter(Boolean).join(' ')}`;
        const fullName = master ? `${master.name} ${variationName}` : `Unknown Product ${variationName}`;
        
        return {
            ...v,
            name: fullName,
            brand: master?.brand || '',
            model: master?.model || '',
            category: master?.category || 'Phone',
            productNo: `PR-${v.id}`, // Legacy mapping
            variations: {
                storage: v.attributes.storage || '',
                color: v.attributes.color || '',
                country: v.attributes.country || '',
                condition: (v.attributes.condition as any) || 'NEW',
                ...v.attributes
            }
        };
    });
};

export const MOCK_PRODUCTS_DATA: Product[] = flattenProducts();

export const MOCK_INVENTORY_DATA: InventoryItem[] = [
  { id: 'INV001', productName: 'iPhone 15 Pro 256GB Black Titanium', sku: 'IP15P-256-BLK-US-NEW', category: 'Phone', quantity: 25, location: 'Main Store', costPrice: 999, sellingPrice: 1199, lastStockCountDate: '2023-10-20', variationId: 'PV-001' },
  { id: 'INV002', productName: 'iPhone 14 128GB Starlight', sku: 'IP14-128-STL-LL-NEW', category: 'Phone', quantity: 40, location: 'Main Store', costPrice: 650, sellingPrice: 799, lastStockCountDate: '2023-10-20', variationId: 'PV-002' },
];

export const MOCK_BRANCHES_DATA: Branch[] = [
    { id: 'B001', name: 'Main Store', address: '123 Market St, Downtown', phone: '555-1234', manager: 'Alice Johnson' },
    { id: 'B002', name: 'Warehouse A', address: '456 Industrial Ave, South End', phone: '555-5678', manager: 'Bob Williams' },
];

export const MOCK_STOCK_TRANSFERS_DATA: StockTransfer[] = [
    { id: 'ST001', date: '2023-10-25', fromBranch: 'Warehouse A', toBranch: 'Main Store', productName: 'iPhone 15 Pro', quantity: 10, status: 'Completed' },
];

export const MOCK_EXPENSES_DATA: Expense[] = [
    { id: 'EXP001', date: '2023-10-28', category: 'Rent', payee: 'City Properties', amount: 2500, status: 'Paid' },
];

export const MOCK_SETTLEMENTS_DATA: Settlement[] = [
    { id: 'SET001', date: '2023-10-28', amount: 1245.50, type: 'Card Settlement', fromAccount: 'Stripe', toAccount: 'Main Bank Account' },
];

export const MOCK_CASH_FLOW_DATA: CashFlowActivity[] = [
    { id: 'CF001', date: '2023-10-28', description: 'Cash sales from customers', category: 'Operating', amount: 1245.50, type: 'inflow' },
];

export const MOCK_CONTACTS_DATA: Contact[] = [
    { id: 'C001', name: 'John Doe', type: 'Customer', email: 'john.d@example.com', phone: '555-0101', company: 'JD Industries', lastContactDate: '2023-10-26' },
];

export const MOCK_TAX_RATES_DATA: TaxRate[] = [
    { id: 'TAX001', name: 'No Tax', rate: 0, isDefault: true },
    { id: 'TAX003', name: 'VAT', rate: 10, isDefault: false },
];
