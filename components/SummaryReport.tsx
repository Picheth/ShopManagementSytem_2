import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Line, ComposedChart } from 'recharts';
import Card from './Card';
import { MOCK_ACCOUNTS_DATA } from '../data/mockData';
import type { Account } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const monthlyData = [
    { name: 'Jul', revenue: 42000, profit: 18000 },
    { name: 'Aug', revenue: 45000, profit: 21000 },
    { name: 'Sep', revenue: 52000, profit: 25000 },
    { name: 'Oct', revenue: 48000, profit: 22000 },
];

const SummaryReport: React.FC = () => {
    const financialData = useMemo(() => {
        const accountsByType = MOCK_ACCOUNTS_DATA.reduce((acc, account) => {
            if (!acc[account.type]) {
                acc[account.type] = [];
            }
            acc[account.type].push(account);
            return acc;
        }, {} as Record<Account['type'], Account[]>);

        const totalRevenue = (accountsByType['Revenue'] || []).reduce((sum, acc) => sum + acc.balance, 0);
        const cogs = (accountsByType['Expense'] || []).find(acc => acc.subType === 'Direct Costs')?.balance || 0;
        const operatingExpenses = (accountsByType['Expense'] || []).filter(acc => acc.subType !== 'Direct Costs').reduce((sum, acc) => sum + acc.balance, 0);
        const grossProfit = totalRevenue - cogs;
        const netIncome = grossProfit - operatingExpenses;
        const totalAssets = (accountsByType['Asset'] || []).reduce((sum, acc) => sum + acc.balance, 0);
        const totalLiabilities = (accountsByType['Liability'] || []).reduce((sum, acc) => sum + acc.balance, 0);
        const totalEquity = (accountsByType['Equity'] || []).reduce((sum, acc) => sum + acc.balance, 0);
        const currentAssets = (accountsByType['Asset'] || []).filter(a => a.subType === 'Current Asset').reduce((sum, acc) => sum + acc.balance, 0);
        const currentLiabilities = (accountsByType['Liability'] || []).filter(a => a.subType === 'Current Liability').reduce((sum, acc) => sum + acc.balance, 0);
        
        const expenseBreakdown = (accountsByType['Expense'] || [])
            .filter(acc => acc.subType !== 'Direct Costs' && !acc.parentId)
            .map(acc => ({ name: acc.name, value: acc.balance }));

        return {
            netIncome,
            grossProfitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
            currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
            netWorth: totalEquity,
            totalRevenue,
            grossProfit,
            totalAssets,
            totalLiabilities,
            expenseBreakdown,
        };
    }, []);

    const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-text-main">Financial Summary Report</h2>
                <p className="text-sm text-text-light">As of {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Net Income" value={formatCurrency(financialData.netIncome)} change="Fiscal Year" changeType={financialData.netIncome > 0 ? "increase" : "decrease"} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.826-1.106-2.156 0-2.982l.879-.659m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>} />
                <Card title="Gross Profit Margin" value={`${financialData.grossProfitMargin.toFixed(2)}%`} change="Efficiency" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28L13.72 21" /></svg>} />
                <Card title="Current Ratio" value={financialData.currentRatio.toFixed(2)} change="Liquidity" changeType={financialData.currentRatio > 2 ? "increase" : "decrease"} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.21-.138 2.43-.138 3.662v.512A48.678 48.678 0 0 0 12 15a48.678 48.678 0 0 0 7.5-2.488V12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>} />
                <Card title="Net Worth (Equity)" value={formatCurrency(financialData.netWorth)} change="Business Value" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5M6.375 7.5h11.25m-11.25 3h11.25m-11.25 3h11.25m-11.25 3h11.25M6.375 21v-12A2.625 2.625 0 0 0 3.75 6.375v0A2.625 2.625 0 0 0 1.125 9v12" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Revenue vs. Profit</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="revenue" name="Revenue" barSize={20} fill="#3B82F6" />
                            <Line type="monotone" dataKey="profit" name="Profit" stroke="#10B981" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                 <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={financialData.expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {financialData.expenseBreakdown.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Income Statement Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b"><span>Total Revenue</span><span className="font-medium">{formatCurrency(financialData.totalRevenue)}</span></div>
                        <div className="flex justify-between py-2 border-b"><span>Gross Profit</span><span className="font-medium">{formatCurrency(financialData.grossProfit)}</span></div>
                        <div className="flex justify-between py-2 font-bold bg-gray-50 -mx-6 px-6"><span>Net Income</span><span className="text-primary">{formatCurrency(financialData.netIncome)}</span></div>
                    </div>
                </div>
                 <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Balance Sheet Summary</h3>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b"><span>Total Assets</span><span className="font-medium">{formatCurrency(financialData.totalAssets)}</span></div>
                        <div className="flex justify-between py-2 border-b"><span>Total Liabilities</span><span className="font-medium">{formatCurrency(financialData.totalLiabilities)}</span></div>
                        <div className="flex justify-between py-2 font-bold bg-gray-50 -mx-6 px-6"><span>Total Equity</span><span className="text-primary">{formatCurrency(financialData.netWorth)}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryReport;