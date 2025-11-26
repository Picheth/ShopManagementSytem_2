import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Card from './Card';
import { MOCK_ACCOUNTS_DATA } from '../data/mockData';
import type { Account } from '../types';

const ProfitAndLoss: React.FC = () => {
    const { 
        totalRevenue,
        grossProfit,
        netIncome,
        netProfitMargin,
        grossProfitMargin,
        chartData
    } = useMemo(() => {
        const revenue = MOCK_ACCOUNTS_DATA.filter(a => a.type === 'Revenue').reduce((sum, acc) => sum + acc.balance, 0);
        const cogs = MOCK_ACCOUNTS_DATA.find(a => a.subType === 'Direct Costs')?.balance || 0;
        const expenses = MOCK_ACCOUNTS_DATA.filter(a => a.type === 'Expense' && a.subType !== 'Direct Costs').reduce((sum, acc) => sum + acc.balance, 0);
        
        const grossProfit = revenue - cogs;
        const netIncome = grossProfit - expenses;

        const chartData = [
            { name: 'Total Revenue', value: revenue },
            { name: 'Gross Profit', value: grossProfit },
            { name: 'Net Income', value: netIncome },
        ];

        return {
            totalRevenue: revenue,
            grossProfit,
            netIncome,
            netProfitMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0,
            grossProfitMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
            chartData
        };
    }, []);

    const formatCurrency = (value: number) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Custom Tooltip for Waterfall effect illusion
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            let change = 0;
            let changeLabel = '';
            if (label === 'Gross Profit') {
                change = totalRevenue - grossProfit;
                changeLabel = 'COGS';
            } else if (label === 'Net Income') {
                change = grossProfit - netIncome;
                changeLabel = 'Operating Expenses';
            }

            return (
                <div className="bg-white p-2 border rounded shadow-lg text-sm">
                    <p className="font-bold">{label}</p>
                    <p className="text-primary">{`Amount: ${formatCurrency(payload[0].value)}`}</p>
                    {change > 0 && <p className="text-red-500">{`- ${changeLabel}: ${formatCurrency(change)}`}</p>}
                </div>
            );
        }
        return null;
    };


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="Total Revenue" value={formatCurrency(totalRevenue)} change="All sales & services" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.75A.75.75 0 0 1 3 4.5h.75m0 0h.75A.75.75 0 0 1 5.25 6v.75m0 0h.75A.75.75 0 0 1 6.75 6v-.75m0 0h.75A.75.75 0 0 1 8.25 6v.75m0 0h.75a.75.75 0 0 1 .75-.75V5.25m0 0h.75A.75.75 0 0 1 11.25 6v.75m0 0h.75a.75.75 0 0 1 .75-.75V5.25m0 0h.75A.75.75 0 0 1 13.5 6v.75m0 0h.75a.75.75 0 0 1 .75-.75V5.25m0 0h.75a.75.75 0 0 1 .75.75v.75m3 12.75H2.25" /></svg>} />
                <Card title="Gross Profit Margin" value={`${grossProfitMargin.toFixed(2)}%`} change="Profit on goods" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m15.362 5.214.358-.357a.75.75 0 0 1 1.06 0l2.122 2.121a.75.75 0 0 1 0 1.06l-.357.358m-2.122-2.121 2.122 2.121m-2.122-2.121L15.362 5.214Zm-2.122 2.121-2.121-2.121a.75.75 0 0 0-1.06 0l-.358.357m2.121 2.121-.357-.357m2.121 2.121L13.24 7.335m2.122 2.122L11.12 11.58m4.243 4.242-2.122-2.121m2.122 2.121.357.358a.75.75 0 0 0 1.06 0l2.121-2.122a.75.75 0 0 0 0-1.06l-.358-.357m-2.121 2.121-2.121-2.121" /></svg>} />
                <Card title="Net Profit Margin" value={`${netProfitMargin.toFixed(2)}%`} change="Overall profitability" changeType={netProfitMargin > 0 ? "increase" : "decrease"} icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28L13.72 21" /></svg>} />
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Profit & Loss Waterfall</h3>
                <p className="text-sm text-text-light mb-4">This chart shows how revenue is reduced by costs to result in the final net income.</p>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `$${value/1000}k`}/>
                        <YAxis type="category" dataKey="name" width={120}/>
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ProfitAndLoss;