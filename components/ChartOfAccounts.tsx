import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import AccountForm from './AccountForm';
import { MOCK_ACCOUNTS_DATA } from '../src/data/mockData';
import type { Account } from '../types';

const ChartOfAccounts: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const accountOrder: Account['type'][] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
    
    // Initialize all groups to be expanded by default
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
        accountOrder.reduce((acc, type) => ({ ...acc, [type]: true }), {})
    );

    const toggleGroup = (type: Account['type']) => {
        setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
    };

    const handleSaveAccount = (newAccount: Account) => {
        setAccounts(prev => [...prev, newAccount]);
        setIsModalOpen(false);
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return accounts;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        const accountsById = new Map(accounts.map(acc => [acc.id, acc]));
        
        const requiredIds = new Set<string>();

        for (const account of accounts) {
            if (
                account.name.toLowerCase().includes(lowercasedFilter) ||
                account.id.toLowerCase().includes(lowercasedFilter)
            ) {
                let current = account;
                while (current) {
                    requiredIds.add(current.id);
                    const parent = current.parentId ? accountsById.get(current.parentId) : undefined;
                    current = parent!;
                }
            }
        }

        return accounts.filter(account => requiredIds.has(account.id));
    }, [accounts, searchTerm]);

    const groupedAccounts = useMemo(() => {
        return filteredData.reduce((acc, account) => {
            const { type } = account;
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(account);
            return acc;
        }, {} as Record<Account['type'], Account[]>);
    }, [filteredData]);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Chart of Accounts</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or ID..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add New Account
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-card">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-1/6">Account ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-2/6">Account Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-1/6">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider w-1/6">Sub-Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider w-1/6">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accountOrder.map(type => {
                                const accounts = groupedAccounts[type];
                                if (!accounts || accounts.length === 0) return null;

                                const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);
                                const isExpanded = !!expandedGroups[type];

                                const childrenByParentId = accounts.reduce((map, acc) => {
                                    if (acc.parentId) {
                                        if (!map.has(acc.parentId)) map.set(acc.parentId, []);
                                        map.get(acc.parentId)!.push(acc);
                                    }
                                    return map;
                                }, new Map<string, Account[]>());

                                const rootAccounts = accounts.filter(acc => !acc.parentId || !accounts.some(p => p.id === acc.parentId));

                                return (
                                    <React.Fragment key={type}>
                                        <tr className="bg-background border-b-2 border-white hover:bg-gray-200 cursor-pointer" onClick={() => toggleGroup(type)}>
                                            <th colSpan={4} className="px-6 py-2 text-left text-sm font-semibold text-text-main">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{type}</span>
                                                </div>
                                            </th>
                                            <td className="px-6 py-2 text-right text-sm font-semibold text-text-main">{formatCurrency(total)}</td>
                                        </tr>
                                        {isExpanded && rootAccounts.map(account => {
                                            const children = childrenByParentId.get(account.id) || [];
                                            const hasChildren = children.length > 0;
                                            const displayBalance = hasChildren
                                                ? children.reduce((sum, child) => sum + child.balance, 0)
                                                : account.balance;

                                            return (
                                                <React.Fragment key={account.id}>
                                                    <tr className="border-b border-gray-200 hover:bg-gray-50 bg-gray-50/50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{account.id}</td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main ${hasChildren ? 'font-bold' : ''}`}>{account.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{account.type}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{account.subType}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main text-right">{formatCurrency(displayBalance)}</td>
                                                    </tr>
                                                    {hasChildren && children.map(child => (
                                                        <tr key={child.id} className="border-b border-gray-200 hover:bg-gray-50">
                                                            <td className="pl-12 pr-6 py-4 whitespace-nowrap text-sm text-text-light">{child.id}</td>
                                                            <td className="pl-12 pr-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{child.name}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{child.type}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{child.subType}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main text-right">{formatCurrency(child.balance)}</td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Account">
                <AccountForm onClose={() => setIsModalOpen(false)} accounts={accounts} onSave={handleSaveAccount} />
            </Modal>
        </>
    );
};

export default ChartOfAccounts;