import React, { useState, useMemo } from 'react';
import Card from './Card';
import { MOCK_EXPENSES_DATA } from '../src/data/mockData';
import type { Expense } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

const MonthlyExpenseReport: React.FC = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [expenses] = useState<Expense[]>(MOCK_EXPENSES_DATA);
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const expenseCategories = useMemo(() => ['All', ...Array.from(new Set(expenses.filter(e => !e.parentId).map(e => e.category)))], [expenses]);
    
    const handleResetFilters = () => {
        setStartDate(firstDayOfMonth);
        setEndDate(lastDayOfMonth);
        setCategoryFilter('All');
        setStatusFilter('All');
    };

    const filteredData = useMemo(() => {
        return expenses.filter(expense => {
            const expenseDate = new Date(`${expense.date}T00:00:00`);
            const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
            const end = endDate ? new Date(`${endDate}T00:00:00`) : null;
            
            const matchesDate = (!start || expenseDate >= start) && (!end || expenseDate <= end);
            const matchesStatus = statusFilter === 'All' || expense.status === statusFilter;

            if (categoryFilter === 'All') return matchesDate && matchesStatus;

            const parent = expense.parentId ? expenses.find(e => e.id === expense.parentId) : null;
            const matchesCategory = expense.category === categoryFilter || (parent && parent.category === categoryFilter);

            return matchesDate && matchesStatus && matchesCategory;
        });
    }, [expenses, startDate, endDate, categoryFilter, statusFilter]);

    const { totalExpenses, topCategory, categoryChartData } = useMemo(() => {
        if (filteredData.length === 0) {
            return { totalExpenses: 0, topCategory: 'N/A', categoryChartData: [] };
        }
        
        const total = filteredData.reduce((acc, curr) => acc + curr.amount, 0);
        
        const categorySpending = filteredData.reduce((acc, curr) => {
            const parentCategory = curr.parentId ? (expenses.find(e => e.id === curr.parentId)?.category || curr.category) : curr.category;
            acc[parentCategory] = (acc[parentCategory] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

        const top = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const chartData = Object.entries(categorySpending).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);

        return { totalExpenses: total, topCategory: top, categoryChartData: chartData };
    }, [filteredData, expenses]);

    const { rootExpenses, childrenByParentId } = useMemo(() => {
        const childrenMap = new Map<string, Expense[]>();
        const roots: Expense[] = [];
        for (const item of filteredData) {
            if (item.parentId) {
                if (!childrenMap.has(item.parentId)) childrenMap.set(item.parentId, []);
                childrenMap.get(item.parentId)!.push(item);
            } else {
                roots.push(item);
            }
        }
        return { rootExpenses: roots.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), childrenByParentId: childrenMap };
    }, [filteredData]);

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    const renderRow = (expense: Expense, level: number, children: Expense[] = []) => {
        const isExpanded = expandedRows.has(expense.id);
        const hasChildren = children.length > 0;
        const totalAmount = hasChildren ? children.reduce((sum, child) => sum + child.amount, expense.amount) : expense.amount;

        return (
            <React.Fragment key={expense.id}>
                <tr className={`hover:bg-gray-50 border-b border-gray-200 ${level > 0 ? 'bg-gray-50/50' : ''}`}>
                    <td style={{ paddingLeft: `${1.5 + level * 1.5}rem` }} className="py-3 whitespace-nowrap text-sm text-text-main">
                        <div className="flex items-center">
                            {hasChildren && (
                                <button onClick={() => toggleRow(expense.id)} className="mr-2 text-gray-500 hover:text-gray-800">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            )}
                            <span className={hasChildren ? 'font-semibold' : ''}>{expense.category}</span>
                        </div>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-text-light">{expense.date}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-text-light">{expense.payee}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-text-main text-right">{formatCurrency(totalAmount)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${expense.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{expense.status}</span>
                    </td>
                </tr>
                {isExpanded && children.map(child => renderRow(child, level + 1, childrenByParentId.get(child.id) || []))}
            </React.Fragment>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold text-text-main">Monthly Expense Report</h2>
                <div className="border-t border-b border-gray-200 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="categoryFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 sm:text-sm">
                            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 sm:text-sm">
                            <option value="All">All</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card title="Total Expenses" value={formatCurrency(totalExpenses)} change="For selected period" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.136 0-2.25-.333-3.184-.955a5.985 5.985 0 01-1.84-2.185M4.75 4.97a48.416 48.416 0 016.75-.47c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.153.24c1.136 0 2.25-.333 3.184-.955a5.985 5.985 0 001.84-2.185" /></svg>} />
                <Card title="Top Spending Category" value={topCategory} change="Highest spending" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>} />
            </div>
            
            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" name="Total Spent" fill="#3B82F6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Expense Details</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full bg-card">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-2/5">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Payee</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rootExpenses.length > 0 ? (
                                rootExpenses.map(expense => renderRow(expense, 0, childrenByParentId.get(expense.id) || []))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">No expenses found for the selected filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MonthlyExpenseReport;