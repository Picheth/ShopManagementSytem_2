import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import ExpenseForm from './ExpenseForm';
import Card from './Card';
import { MOCK_EXPENSES_DATA } from '../src/data/mockData';
import type { Expense } from '../types';

const Expenses: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>(MOCK_EXPENSES_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [defaultParentForModal, setDefaultParentForModal] = useState<string | undefined>(undefined);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid'>('All');
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const expenseCategories = useMemo(() => ['All', ...Array.from(new Set(expenses.filter(e => !e.parentId).map(e => e.category)))], [expenses]);
    
    const handleAddTopLevelExpense = () => {
        setEditingExpense(null);
        setDefaultParentForModal(undefined);
        setIsModalOpen(true);
    };

    const handleAddSubCategory = (parentId: string) => {
        setEditingExpense(null);
        setDefaultParentForModal(parentId);
        setIsModalOpen(true);
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
        setDefaultParentForModal(expense.parentId);
        setIsModalOpen(true);
    };

    const handleDelete = (expense: Expense) => {
        setExpenseToDelete(expense);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (!expenseToDelete) return;
        
        const idsToDelete = new Set<string>([expenseToDelete.id]);
        
        // If it's a parent, also mark children for deletion
        if (!expenseToDelete.parentId) {
            expenses.forEach(e => {
                if (e.parentId === expenseToDelete.id) {
                    idsToDelete.add(e.id);
                }
            });
        }

        setExpenses(prev => prev.filter(e => !idsToDelete.has(e.id)));
        setIsDeleteConfirmOpen(false);
        setExpenseToDelete(null);
    };
    
    const handleSaveExpense = (expenseData: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expenseData) { // Editing
             setExpenses(prev => prev.map(e => e.id === expenseData.id ? (expenseData as Expense) : e));
        } else { // Adding new
            const newExpense: Expense = {
                ...expenseData,
                id: `EXP${(expenses.length + 1).toString().padStart(3, '0')}`
            };
            setExpenses(prev => [newExpense, ...prev]);
        }
        setIsModalOpen(false);
        setEditingExpense(null);
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
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

    const totalExpenses = useMemo(() => filteredData.reduce((acc, curr) => acc + curr.amount, 0), [filteredData]);
    
    const topCategory = useMemo(() => {
        if (filteredData.length === 0) return 'N/A';
        const categorySpending = filteredData.reduce((acc, curr) => {
            const parentCategory = curr.parentId ? (expenses.find(e => e.id === curr.parentId)?.category || curr.category) : curr.category;
            acc[parentCategory] = (acc[parentCategory] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
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


    const handleExportCSV = () => {
        const headers = ['ID', 'Date', 'Category', 'Payee', 'Amount', 'Status', 'Parent ID'].join(',');
        const rows = filteredData.map(e => [e.id, e.date, `"${e.category}"`, `"${e.payee}"`, e.amount, e.status, e.parentId || ''].join(','));
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'expenses.csv';
        link.click();
    };

    const handleImport = () => alert("This feature is not yet implemented. It would allow importing expenses from a CSV file.");
    
    const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

    const renderRow = (expense: Expense, level: number, children: Expense[] = []) => {
        const isExpanded = expandedRows.has(expense.id);
        const hasChildren = children.length > 0;
        const totalAmount = hasChildren ? children.reduce((sum, child) => sum + child.amount, expense.amount) : expense.amount;

        return (
            <React.Fragment key={expense.id}>
                <tr className="hover:bg-gray-50 border-b border-gray-200">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-text-light">{expense.id}</td>
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
                     <td className="px-6 py-3 whitespace-nowrap text-sm text-center">
                        <button onClick={() => handleEdit(expense)} className="text-secondary hover:text-green-700 font-medium mr-3">Edit</button>
                        <button onClick={() => handleDelete(expense)} className="text-red-600 hover:text-red-800 font-medium mr-3">Delete</button>
                        {!expense.parentId && (
                            <button onClick={() => handleAddSubCategory(expense.id)} className="text-primary hover:text-primary-dark font-medium">Add Sub</button>
                        )}
                    </td>
                </tr>
                {isExpanded && children.map(child => renderRow(child, level + 1, childrenByParentId.get(child.id) || []))}
            </React.Fragment>
        );
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card title="Total Expenses" value={formatCurrency(totalExpenses)} change={`${filteredData.length} records`} changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.136 0-2.25-.333-3.184-.955a5.985 5.985 0 01-1.84-2.185M4.75 4.97a48.416 48.416 0 016.75-.47c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726c-.122.499.106 1.028.589 1.202a5.989 5.989 0 002.153.24c1.136 0 2.25-.333 3.184-.955a5.985 5.985 0 001.84-2.185" /></svg>} />
                    <Card title="Top Expense Category" value={topCategory} change="Highest spending" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" /></svg>} />
                </div>
                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Expense Records</h2>
                         <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end flex-wrap">
                             <button onClick={handleImport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Import</button>
                             <button onClick={handleExportCSV} className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export</button>
                            <button onClick={handleAddTopLevelExpense} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add New Expense</button>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-200 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                             <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                            <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                        </div>
                        <div>
                             <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                            <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select id="categoryFilter" className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 sm:text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                                {expenseCategories.map(category => <option key={category} value={category}>{category}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select id="statusFilter" className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 sm:text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Paid' | 'Unpaid')}>
                                <option value="All">All Statuses</option>
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-card">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-2/6">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">Payee</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rootExpenses.map(expense => renderRow(expense, 0, childrenByParentId.get(expense.id) || []))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingExpense ? "Edit Expense" : "Add New Expense"}>
                <ExpenseForm onClose={() => setIsModalOpen(false)} allExpenses={expenses} onSave={handleSaveExpense} defaultParentId={defaultParentForModal} expenseToEdit={editingExpense} />
            </Modal>
            
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                {expenseToDelete && (
                     <div className="space-y-4">
                        <p>Are you sure you want to delete expense <strong>{expenseToDelete.category}</strong>? If this is a parent category, all its sub-expenses will also be deleted. This action cannot be undone.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
                            <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Expenses;