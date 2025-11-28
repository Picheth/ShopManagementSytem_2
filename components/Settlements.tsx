import React, { useState } from 'react';
import Modal from './Modal';
import SettlementForm from './SettlementForm';
import DataTable from './DataTable';
import { MOCK_SETTLEMENTS_DATA } from '../src/data/mockData';
import type { Settlement, ColumnDefinition } from '../types';

const columns: ColumnDefinition<Settlement>[] = [
    { header: 'Settlement ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'Amount', accessor: 'amount', render: (val) => `$${Number(val).toFixed(2)}` },
    { header: 'Type', accessor: 'type' },
    { header: 'From Account', accessor: 'fromAccount' },
    { header: 'To Account', accessor: 'toAccount' },
    {
        header: 'Actions',
        accessor: 'id',
        render: () => (
            <button className="text-primary hover:text-primary-dark text-sm font-medium">View Details</button>
        )
    }
];

const Settlements: React.FC = () => {
    const [settlements, setSettlements] = useState<Settlement[]>(MOCK_SETTLEMENTS_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveSettlement = (newSettlementData: Omit<Settlement, 'id'>) => {
        const newSettlement: Settlement = {
            ...newSettlementData,
            id: `SET${(settlements.length + 1).toString().padStart(3, '0')}`,
        };
        setSettlements(prev => [newSettlement, ...prev]);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Financial Settlements</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Add New Settlement
                    </button>
                </div>
                {settlements.length > 0 ? (
                    <DataTable columns={columns} data={settlements} />
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-text-main">No settlements recorded yet.</h3>
                        <p className="mt-1 text-sm text-text-light">
                            Click "Add New Settlement" to record a financial transaction.
                        </p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record a New Settlement">
                <SettlementForm onClose={() => setIsModalOpen(false)} onSave={handleSaveSettlement} />
            </Modal>
        </>
    );
};

export default Settlements;
