import React, { useMemo } from 'react';
import { MOCK_ACCOUNTS_DATA } from '../src/data/mockData';
import type { Account } from '../types';

const BalanceSheet: React.FC = () => {
    
    const { assets, liabilities, equity } = useMemo(() => {
        const assets = MOCK_ACCOUNTS_DATA.filter(acc => acc.type === 'Asset');
        const liabilities = MOCK_ACCOUNTS_DATA.filter(acc => acc.type === 'Liability');
        const equity = MOCK_ACCOUNTS_DATA.filter(acc => acc.type === 'Equity');
        return { assets, liabilities, equity };
    }, []);
    
    const formatCurrency = (value: number) => {
        const isNegative = value < 0;
        const formatted = Math.abs(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        return isNegative ? `(${formatted})` : formatted;
    };

    const renderAccountRow = (account: Account, isSub: boolean = false) => (
        <div key={account.id} className={`flex justify-between py-2 border-b ${isSub ? 'pl-6' : ''}`}>
            <span>{account.name}</span>
            <span>{formatCurrency(account.balance)}</span>
        </div>
    );
    
    const renderSection = (title: string, accounts: Account[], showSubTypes: boolean = true) => {
        const subTypes = showSubTypes ? [...new Set(accounts.map(a => a.subType))] : [null];
        const total = accounts.reduce((sum, acc) => sum + acc.balance, 0);

        return (
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-text-main mt-4 border-b-2 pb-2">{title}</h3>
                {subTypes.map(subType => {
                     const filteredAccounts = accounts.filter(a => !showSubTypes || a.subType === subType);
                     const subTypeTotal = filteredAccounts.reduce((sum, acc) => sum + acc.balance, 0);
                     if (filteredAccounts.length === 0) return null;

                     return (
                         <React.Fragment key={subType}>
                            {subType && <h4 className="font-medium text-primary pt-2">{subType}</h4>}
                            {filteredAccounts.map(account => renderAccountRow(account, !!account.parentId))}
                            {subType && (
                                 <div className="flex justify-between py-2 font-semibold text-text-main">
                                    <span>Total {subType}</span>
                                    <span>{formatCurrency(subTypeTotal)}</span>
                                </div>
                            )}
                         </React.Fragment>
                     );
                })}
                <div className="flex justify-between py-2 font-bold text-lg bg-gray-100 -mx-6 px-6 mt-2">
                    <span>Total {title}</span>
                    <span>{formatCurrency(total)}</span>
                </div>
            </div>
        )
    };
    
    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return (
        <div className="bg-card p-6 rounded-lg shadow space-y-4">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-text-main">Balance Sheet</h2>
                <p className="text-sm text-text-light">As of {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12">
                <div>{renderSection('Assets', assets)}</div>
                <div>
                    {renderSection('Liabilities', liabilities, false)}
                    {renderSection('Equity', equity, false)}
                    <div className="flex justify-between py-3 font-bold text-lg bg-gray-100 -mx-6 px-6 mt-4">
                        <span>Total Liabilities & Equity</span>
                        <span>{formatCurrency(totalLiabilitiesAndEquity)}</span>
                    </div>
                </div>
            </div>
            
            <div className={`mt-6 p-4 rounded-md text-center font-bold ${Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 
                    ? `Total Assets (${formatCurrency(totalAssets)}) = Total Liabilities & Equity (${formatCurrency(totalLiabilitiesAndEquity)})`
                    : `Imbalance Detected! Assets: ${formatCurrency(totalAssets)}, Liabilities & Equity: ${formatCurrency(totalLiabilitiesAndEquity)}`}
            </div>
        </div>
    );
};

export default BalanceSheet;