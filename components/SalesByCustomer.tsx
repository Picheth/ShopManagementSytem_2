import React, { useState, useEffect, useMemo } from 'react';
import { getDocs } from './database';
import DataTable from './DataTable';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { Sale, Product, ColumnDefinition } from '../types';
import { MOCK_PRODUCTS_DATA } from '../src/data/mockData';

interface CustomerSaleSummary {
    id: string; // customer name
    customerName: string;
    orderCount: number;
    totalSpent: number;
    totalProfit: number;
    lastPurchaseDate: string;
}

const SalesByCustomer: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [products] = useState<Product[]>(MOCK_PRODUCTS_DATA);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    // FIX: Changed 'Pending' to 'Unpaid' to align with Sale status types
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue'>('All');
    const [sortKey, setSortKey] = useState<keyof CustomerSaleSummary | null>('totalSpent');
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
            if (statusFilter !== 'All') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const dueDate = sale.dueDate ? new Date(sale.dueDate) : null;
                // FIX: Replaced non-existent 'paymentStatus' with 'status'
                let currentStatus = sale.status;
                // FIX: Updated logic to handle correct statuses for identifying overdue sales
                if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
                    currentStatus = 'Overdue';
                }
                if (currentStatus !== statusFilter) return false;
            }
            return true;
        });
    }, [sales, startDate, endDate, statusFilter]);

    const customerSalesData = useMemo(() => {
        const summary: Map<string, CustomerSaleSummary> = new Map();

        filteredSales.forEach(sale => {
            const saleProfit = sale.lineItems.reduce((acc, item) => {
                const product = productsMap.get(item.productId);
                return product ? acc + (item.price - product.costPrice) * item.quantity : acc;
            }, 0);

            const existing = summary.get(sale.customer);
            if (existing) {
                existing.orderCount++;
                existing.totalSpent += sale.total;
                existing.totalProfit += saleProfit;
                if (sale.date > existing.lastPurchaseDate) {
                    existing.lastPurchaseDate = sale.date;
                }
            } else {
                summary.set(sale.customer, {
                    id: sale.customer,
                    customerName: sale.customer,
                    orderCount: 1,
                    totalSpent: sale.total,
                    totalProfit: saleProfit,
                    lastPurchaseDate: sale.date,
                });
            }
        });

        return Array.from(summary.values());
    }, [filteredSales, productsMap]);

    const handleSort = (key: keyof CustomerSaleSummary) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    const sortedData = useMemo(() => {
        const data = [...customerSalesData];
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
    }, [customerSalesData, sortKey, sortDirection]);

    const columns: ColumnDefinition<CustomerSaleSummary>[] = [
        { header: 'Customer Name', accessor: 'customerName', sortable: true },
        { header: 'Order Count', accessor: 'orderCount', sortable: true },
        { header: 'Total Spent', accessor: 'totalSpent', sortable: true, render: val => `$${Number(val).toLocaleString()}` },
        { header: 'Total Profit', accessor: 'totalProfit', sortable: true, render: val => `$${Number(val).toLocaleString()}` },
        { header: 'Last Purchase', accessor: 'lastPurchaseDate', sortable: true },
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-text-main">Sales by Customer Report</h2>
                        <p className="text-sm text-text-light">Identify your most valuable customers.</p>
                    </div>
                </div>
                <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
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
                <h3 className="text-lg font-semibold mb-4">Top 10 Customers by Spending</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedData.slice(0, 10)} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(val) => `$${Number(val)/1000}k`} />
                        <YAxis type="category" dataKey="customerName" width={150} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="totalSpent" name="Total Spent" fill="#10B981" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Detailed Customer Sales</h3>
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

export default SalesByCustomer;