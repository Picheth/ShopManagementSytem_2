import React, { useState, useEffect, useMemo } from 'react';
import { getDocs } from './database';
import DataTable from './DataTable';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Sale, Product, ColumnDefinition } from '../types';
import { MOCK_PRODUCTS_DATA } from '../src/data/mockData';

interface ProductSaleSummary {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantitySold: number;
    totalRevenue: number;
    totalProfit: number;
}

const SalesByProduct: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [products] = useState<Product[]>(MOCK_PRODUCTS_DATA);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    // FIX: Changed status type from 'Pending' to use 'Unpaid' and 'Partially Paid' to match Sale status types
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue'>('All');
    const [sortKey, setSortKey] = useState<keyof ProductSaleSummary | null>('totalRevenue');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchSales = async () => {
            setIsLoading(true);
            try {
                const salesSnapshot = await getDocs('sales');
                const salesList = salesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[];
                setSales(salesList);
            } catch (error) { console.error("Error fetching sales data: ", error); }
            finally { setIsLoading(false); }
        };
        fetchSales();
    }, []);

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const filteredSales = useMemo(() => {
        return sales.filter(sale => {
            if (startDate && sale.date < startDate) return false;
            if (endDate && sale.date > endDate) return false;
            if (customerFilter && !sale.customer.toLowerCase().includes(customerFilter.toLowerCase())) return false;
            if (statusFilter !== 'All') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = sale.dueDate ? new Date(sale.dueDate) : null;
                // FIX: Replaced non-existent 'paymentStatus' with 'status'
                let currentStatus = sale.status;
                // FIX: Updated logic to correctly identify overdue sales instead of using 'Pending'
                if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
                    currentStatus = 'Overdue';
                }
                if (currentStatus !== statusFilter) return false;
            }
            return true;
        });
    }, [sales, startDate, endDate, customerFilter, statusFilter]);

    const productSalesData = useMemo(() => {
        const summary: Map<string, ProductSaleSummary> = new Map();

        filteredSales.forEach(sale => {
            sale.lineItems.forEach(item => {
                const product = productsMap.get(item.productId);
                if (!product) return;

                const profit = (item.price - product.costPrice) * item.quantity;
                const revenue = item.price * item.quantity;

                const existing = summary.get(item.productId);
                if (existing) {
                    existing.quantitySold += item.quantity;
                    existing.totalRevenue += revenue;
                    existing.totalProfit += profit;
                } else {
                    summary.set(item.productId, {
                        id: item.productId,
                        name: item.productName,
                        sku: product.id,
                        category: product.category,
                        quantitySold: item.quantity,
                        totalRevenue: revenue,
                        totalProfit: profit,
                    });
                }
            });
        });

        return Array.from(summary.values());
    }, [filteredSales, productsMap]);

    const handleSort = (key: keyof ProductSaleSummary) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        const data = [...productSalesData];
        if (sortKey) {
            data.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];
                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }
                return sortDirection === 'desc' ? -comparison : comparison;
            });
        }
        return data;
    }, [productSalesData, sortKey, sortDirection]);

    const columns: ColumnDefinition<ProductSaleSummary>[] = [
        { header: 'Product', accessor: 'name', sortable: true, render: (_, row) => <div><div className="font-medium">{row.name}</div><div className="text-xs text-text-light">{row.sku}</div></div> },
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Quantity Sold', accessor: 'quantitySold', sortable: true },
        { header: 'Total Revenue', accessor: 'totalRevenue', sortable: true, render: val => `$${Number(val).toLocaleString()}` },
        { header: 'Total Profit', accessor: 'totalProfit', sortable: true, render: val => `$${Number(val).toLocaleString()}` },
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-text-main">Sales by Product Report</h2>
                        <p className="text-sm text-text-light">Analyze sales performance for each product.</p>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="customerFilter" className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                        <input type="text" id="customerFilter" value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} placeholder="Customer name..." className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="statusFilter" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 sm:text-sm">
                            <option value="All">All Statuses</option>
                            <option value="Paid">Paid</option>
                            {/* FIX: Replaced 'Pending' with 'Unpaid' and 'Partially Paid' */}
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Top 10 Products by Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(val) => `$${Number(val)/1000}k`} />
                        <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="totalRevenue" name="Revenue" fill="#3B82F6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Detailed Product Sales</h3>
                <DataTable 
                    columns={columns} 
                    data={sortedData}
                    onSort={handleSort as (key: any) => void}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                />
            </div>
        </div>
    );
};

export default SalesByProduct;