import React, { useState, useEffect, useMemo } from 'react';
import { getDocs } from './database';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import Card from './Card';
import type { Sale, Product } from '../types';
import { MOCK_PRODUCTS_DATA } from '../src/data/mockData';

const COLORS = {
    Paid: '#10B981',
    Unpaid: '#F59E0B',
    'Partially Paid': '#3B82F6',
    Overdue: '#EF4444',
};

const SalesSummary: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [products] = useState<Product[]>(MOCK_PRODUCTS_DATA); // Use mock products for now
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [customerFilter, setCustomerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue'>('All');

    useEffect(() => {
        const fetchSales = async () => {
            setIsLoading(true);
            try {
                const salesSnapshot = await getDocs('sales');
                const salesList = salesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[];
                setSales(salesList);
            } catch (error) {
                console.error("Error fetching sales data: ", error);
            } finally {
                setIsLoading(false);
            }
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
                let currentStatus = sale.status;
                if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
                    currentStatus = 'Overdue';
                }
                if (currentStatus !== statusFilter) return false;
            }
            return true;
        });
    }, [sales, startDate, endDate, customerFilter, statusFilter]);

    const summaryData = useMemo(() => {
        let totalRevenue = 0;
        let totalProfit = 0;
        const statusCounts: Record<'Paid' | 'Unpaid' | 'Partially Paid' | 'Overdue', number> = { Paid: 0, Unpaid: 0, 'Partially Paid': 0, Overdue: 0 };
        const dailyData: { [date: string]: { revenue: number, profit: number } } = {};

        filteredSales.forEach(sale => {
            totalRevenue += sale.total;
            
            let saleProfit = 0;
            sale.lineItems.forEach(item => {
                const product = productsMap.get(item.productId);
                if (product) {
                    saleProfit += (item.price - product.costPrice) * item.quantity;
                }
            });
            totalProfit += saleProfit;

            // Determine current status
            const today = new Date(); today.setHours(0,0,0,0);
            const dueDate = sale.dueDate ? new Date(sale.dueDate) : null;
            let currentStatus = sale.status;
            if ((currentStatus === 'Unpaid' || currentStatus === 'Partially Paid') && dueDate && dueDate < today) {
                currentStatus = 'Overdue';
            }
            if (currentStatus in statusCounts) {
                statusCounts[currentStatus as keyof typeof statusCounts]++;
            }
            
            // Aggregate daily data
            if (!dailyData[sale.date]) {
                dailyData[sale.date] = { revenue: 0, profit: 0 };
            }
            dailyData[sale.date].revenue += sale.total;
            dailyData[sale.date].profit += saleProfit;
        });
        
        const chartStatusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        const chartDailyData = Object.entries(dailyData)
            .map(([date, values]) => ({ date, ...values }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return {
            totalRevenue,
            totalProfit,
            totalSales: filteredSales.length,
            avgOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
            chartStatusData,
            chartDailyData,
        };
    }, [filteredSales, productsMap]);

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-text-main">Sales Summary Report</h2>
                        <p className="text-sm text-text-light">Overview of sales performance.</p>
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
                            <option value="Unpaid">Unpaid</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Revenue" value={`$${summaryData.totalRevenue.toLocaleString()}`} change={`${summaryData.totalSales} orders`} changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.826-1.106-2.156 0-2.982l.879-.659m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>} />
                <Card title="Total Profit" value={`$${summaryData.totalProfit.toLocaleString()}`} change="Est. net earnings" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28L13.72 21" /></svg>} />
                <Card title="Total Sales" value={String(summaryData.totalSales)} change="Number of orders" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>} />
                <Card title="Avg. Order Value" value={`$${summaryData.avgOrderValue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} change="Per transaction" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m-6 2.25h6M12 8.25v10.5m0 0l-3-3m3 3l3-3m-3-3.75l3 3.75m-3-3.75l-3 3.75" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={summaryData.chartDailyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                            <Legend />
                            <Bar dataKey="revenue" barSize={20} fill="#3B82F6" />
                            <Line type="monotone" dataKey="profit" stroke="#10B981" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                 <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Sales by Payment Status</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={summaryData.chartStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {summaryData.chartStatusData.map((entry) => <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default SalesSummary;