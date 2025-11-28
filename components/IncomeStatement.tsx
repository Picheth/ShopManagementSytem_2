import React, { useMemo } from 'react';
import { MOCK_ACCOUNTS_DATA } from '../src/data/mockData';
import type { Account } from '../types';

const IncomeStatement: React.FC = () => {
    const { revenue, cogs, expenses, grossProfit, netIncome } = useMemo(() => {
        const revenueAccounts = MOCK_ACCOUNTS_DATA.filter(a => a.type === 'Revenue');
        const expenseAccounts = MOCK_ACCOUNTS_DATA.filter(a => a.type === 'Expense');
        
        const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const cogs = expenseAccounts.find(a => a.subType === 'Direct Costs') || { balance: 0, name: 'Cost of Goods Sold' };
        const operatingExpenses = expenseAccounts.filter(a => a.subType !== 'Direct Costs');
        const totalOperatingExpenses = operatingExpenses.reduce((sum, acc) => sum + acc.balance, 0);

        const grossProfit = totalRevenue - cogs.balance;
        const netIncome = grossProfit - totalOperatingExpenses;
        
        return {
            revenue: { accounts: revenueAccounts, total: totalRevenue },
            cogs: { account: cogs, total: cogs.balance },
            expenses: { accounts: operatingExpenses, total: totalOperatingExpenses },
            grossProfit,
            netIncome
        };
    }, []);

    const formatCurrency = (value: number) => {
        const isNegative = value < 0;
        const formatted = Math.abs(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        return isNegative ? `(${formatted})` : formatted;
    };

    const renderRow = (label: string, value: number, isSub: boolean = false, isTotal: boolean = false) => (
        <div className={`flex justify-between py-2 border-b ${isSub ? 'pl-8' : ''} ${isTotal ? 'font-semibold' : ''}`}>
            <span>{label}</span>
            <span>{formatCurrency(value)}</span>
        </div>
    );

    return (
        <div className="bg-card p-6 rounded-lg shadow max-w-4xl mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-main">Income Statement</h2>
                <p className="text-sm text-text-light">For the Period Ending {new Date().toLocaleDateString()}</p>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-text-main pb-2 border-b-2">Revenue</h3>
                    {revenue.accounts.map(acc => renderRow(acc.name, acc.balance, true))}
                    {renderRow('Total Revenue', revenue.total, false, true)}
                </div>
                
                <div>
                     {renderRow(cogs.account.name, cogs.total)}
                </div>

                <div className="flex justify-between py-3 font-bold text-lg bg-gray-100 -mx-6 px-6">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(grossProfit)}</span>
                </div>
                
                 <div>
                    <h3 className="text-lg font-semibold text-text-main mt-4 pb-2 border-b-2">Operating Expenses</h3>
                    {expenses.accounts.map(acc => renderRow(acc.name, acc.balance, !!acc.parentId))}
                    {renderRow('Total Operating Expenses', expenses.total, false, true)}
                </div>

                <div className={`flex justify-between py-3 font-bold text-xl ${netIncome >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} -mx-6 px-6`}>
                    <span>Net Income</span>
                    <span>{formatCurrency(netIncome)}</span>
                </div>
            </div>
        </div>
    );
};

export default IncomeStatement;