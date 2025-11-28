
import type React from 'react';

export interface NavItem {
  name: string;
  icon: React.ReactNode;
  component: React.ComponentType;
}

export interface NavGroup {
    group: string;
    items: NavItem[];
}

export interface CardData {
    title: string;
    value: string;
    change: string;
    changeType: 'increase' | 'decrease';
    icon: React.ReactNode;
}

export interface SaleLineItem {
    productId: string; // Maps to ProductVariation ID (SKU)
    productName: string;
    quantity: number;
    price: number;
    serialNumber?: string;
    serializedItemId?: string;
}

export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Credit Card' | 'Online' | 'Check';

export interface Payment {
  id: string; // Firestore Document ID
  transactionId: string; // e.g. PAY-00001
  referenceId: string; // ID of the Sale or Purchase
  type: 'sale' | 'purchase';
  date: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
}

// Product type definition
export type SimpleProduct = {
  id: string;
  name: string;
  price: number;
  stock: number;
};
export interface Installment {
  id: string; // INST-00001
  planId: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  amountPaid: number;
  status: 'Pending' | 'Paid' | 'Overdue';
  paymentDate?: string;
}

export interface InstallmentPlan {
  id: string; // PLAN-00001
  saleId: string;
  totalAmount: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number; // Annual percentage
  termMonths: number;
  monthlyPayment: number;
  startDate: string;
  status: 'Active' | 'Completed' | 'Defaulted';
}

export interface Sale {
    id: string; // Firestore Document ID
    orderId: string; // e.g., OR-00001
    saleInvoiceId: string; // e.g., SA-00001
    date: string;
    customer: string;
    lineItems: SaleLineItem[];
    subtotal: number;
    taxRateId: string;
    taxAmount: number;
    total: number;
    amountPaid: number;
    status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
    dueDate?: string;
    invoiceType?: 'Tax Invoice' | 'Invoice';
    installmentPlanId?: string;
}

export interface PurchaseLineItem {
    productId: string; // Maps to ProductVariation ID
    productName: string;
    unit: string;
    quantity: number;
    price: number;
    serialNumbers?: string[];
}

export interface Purchase {
    id: string; // Firestore Document ID
    purchaseId?: string; // e.g., PO-20241031-0001
    receivingId: string; // e.g., RO-00001
    date: string;
    supplier: string;
    supplierContact: string;
    invoiceId: string;
    lineItems: PurchaseLineItem[];
    shippingCost?: number;
    otherFees?: number;
    total: number; // Grand total
    amountPaid: number;
    status: 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue';
}

export type PurchaseOrderStatus = 'Pending' | 'Received' | 'Partially Received' | 'Cancelled';

export interface PurchaseOrder {
  id: string; // e.g., PO-00001
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  supplierId: string;
  supplierName: string;
  lineItems: PurchaseLineItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  status: PurchaseOrderStatus;
  notes?: string;
}

export interface InventoryItem {
    id: string;
    productName: string;
    sku: string;
    category: 'Phone' | 'Laptop' | 'Accessory' | 'Repair Part' | 'Tablet';
    quantity: number;
    location: string;
    costPrice: number;
    sellingPrice: number;
    lastStockCountDate?: string;
    variationId?: string; // Link to ProductVariation
}

export interface Products {
    id: string;
    productNo: string;
    sku: string;
    name: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    price: number;
    cost?: number;
    stock?: number;
    description?: string;
    shortModel?: string;
    variations?: {
        ram?: string;
        storage: string;
        color: string;
        generation?: string;
        modelCode?: string;
        yearReleased?: string;
        country: string;
        condition: ProductCondition;
        others?: string;
    };
  }

  export type ProductCondition = 'NEW' | 'USED' | 'Activated' | 'Parts Replace' | 'Others' | 'AUSED';

// --- New Product Hierarchy Structure ---
export interface ProductMaster {
    id: string; // e.g., PM-001
    name: string; // e.g., iPhone 15 Pro
    brand: string; // Apple
    model: string; // iPhone 15 Pro
    category: 'Phone' | 'Laptop' | 'Accessory' | 'Repair Part' | 'Tablet';
    description?: string;
    createdAt?: string;
}

export interface ProductVariation {
    id: string; // e.g., PV-001
    productId: string; // FK to ProductMaster
    sku: string; // Unique SKU e.g. IP15P-256-BLK
    attributes: {
        [key: string]: string; // e.g. { Color: 'Black', Storage: '256GB' }
    };
    price: number; // Selling Price
    costPrice: number;
    stock: number; // Calculated from InventoryItems usually, but kept here for simple cache
    shortModel?: string; // e.g. IP15P
    subCategory?: string; // e.g. Goods for Sale
    condition?: ProductCondition;
}

// The 'Product' interface now represents a Joined/Flattened view of Master + Variation
// This ensures compatibility with existing components (Sales, POS) that expect a single object.
export interface Product extends ProductVariation {
    // Fields from ProductMaster
    name: string; // Constructed: "iPhone 15 Pro - 256GB Black"
    brand: string;
    model: string;
    category: 'Phone' | 'Laptop' | 'Accessory' | 'Repair Part' | 'Tablet';
    
    // Legacy fields for backward compatibility if needed
    productNo: string; 
    variations: {
        ram?: string;
        storage: string;
        color: string;
        generation?: string;
        modelCode?: string;
        yearReleased?: string;
        country: string;
        condition: ProductCondition;
        others?: string;
    };
}

export interface VariationAttribute {
    id: string;
    name: string;
    values: string[];
}

export type SerializedItemStatus = 'In Stock' | 'Sold' | 'Returned' | 'Damaged' | 'Transferred';

export interface SerializedItem {
    id: string; // Unique ID for this item record
    serialNumber: string; // The actual serial number or IMEI
    productId: string; // Foreign key to ProductVariation
    purchaseId: string; // Foreign key to the Purchase
    saleId?: string; // Foreign key to the Sale (if sold)
    status: SerializedItemStatus;
    costPrice: number;
    locationId: string; // Foreign key to the Branch
    dateAdded: string;
}


export interface Branch {
    id: string;
    name: string;
    address: string;
    phone: string;
    manager: string;
}

export interface StockTransfer {
    id: string;
    date: string;
    fromBranch: string;
    toBranch: string;
    productName: string;
    quantity: number;
    status: 'In Transit' | 'Completed' | 'Cancelled';
}

export interface Expense {
    id: string;
    parentId?: string;
    date: string;
    category: string;
    payee: string;
    amount: number;
    status: 'Paid' | 'Unpaid';
}

export interface Settlement {
    id: string;
    date: string;
    amount: number;
    type: 'Bank Transfer' | 'Cash Deposit' | 'Card Settlement' | 'Internal Transfer';
    fromAccount: string;
    toAccount: string;
    notes?: string;
}

export interface Account {
  id: string;
  parentId?: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  balance: number;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: 'Electronics' | 'Accessories' | 'Parts Distributor' | 'Others';
  totalSpent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Sales Staff' | 'Technician';
  status: 'Active' | 'Inactive';
  branchId: string;
}

export interface CashFlowActivity {
    id: string;
    date: string;
    description: string;
    category: 'Operating' | 'Investing' | 'Financing';
    amount: number;
    type: 'inflow' | 'outflow';
}

export interface Contact {
  id: string;
  name: string;
  type: 'Customer' | 'Lead';
  email: string;
  phone: string;
  company?: string;
  lastContactDate: string;
}

export interface TaxRate {
    id: string;
    name: string;
    rate: number;
    isDefault: boolean;
}

export type RepairStatus = 'Received' | 'Diagnosing' | 'Awaiting Parts' | 'In Progress' | 'Ready for Pickup' | 'Completed' | 'Cancelled';

export interface RepairJob {
  id: string; // e.g., REP-00001
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  deviceImei: string;
  reportedIssue: string;
  technicianId?: string; // Links to User.id
  status: RepairStatus;
  receivedDate: string;
  estimatedCompletionDate?: string;
  cost: number;
  notes?: string;
}

export interface MonthlyTaxPayment {
  id: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: PaymentMethod;
  status: 'Paid' | 'Unpaid';
  referenceId?: string;
  notes?: string;
}

export interface TaxPayment {
  no: number;
  taxName: string;
  month: string;
  taxableAmountRiel: number;
  rate: string;
  taxAmountRiel: number;
  taxAmountUsd: number;
}

export interface MonthlyTaxReport {
  companyKh: string; // Company name in Khmer
  companyEn: string; // Company name in English
  vatTin: string; // Tax ID
  telephone: string;
  date: string; // Report date (ISO format)
  exchangeRate: number; // Riel per USD
  month: string; // "September"
  year: number;
  taxes: TaxPayment[];
}

export interface ColumnDefinition<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}
