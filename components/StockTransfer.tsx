import React, { useState } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import StockTransferForm from './StockTransferForm';
import { MOCK_STOCK_TRANSFERS_DATA } from '../data/mockData';
import type { StockTransfer, ColumnDefinition } from '../types';

const columns: ColumnDefinition<StockTransfer>[] = [
    { header: 'Transfer ID', accessor: 'id' },
    { header: 'Date', accessor: 'date' },
    { header: 'From', accessor: 'fromBranch' },
    { header: 'To', accessor: 'toBranch' },
    { header: 'Product', accessor: 'productName' },
    { header: 'Quantity', accessor: 'quantity' },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (status) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          status === 'Completed' ? 'bg-green-100 text-green-800' :
          status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status}
        </span>
      )
    },
    {
        header: 'Actions',
        accessor: 'id',
        render: (id, row) => (
             row.status === 'In Transit' ? 
            <button className="text-primary hover:text-primary-dark text-sm font-medium">Mark as Received</button>
            : <span className="text-text-light text-sm">-</span>
        )
    }
];


const StockTransfer: React.FC = () => {
    const [transfers, setTransfers] = useState<StockTransfer[]>(MOCK_STOCK_TRANSFERS_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveTransfer = (transferData: Omit<StockTransfer, 'id' | 'status'>) => {
        const newTransfer: StockTransfer = {
            ...transferData,
            id: `ST${(transfers.length + 1).toString().padStart(3, '0')}`,
            status: 'In Transit',
        };
        setTransfers(prevTransfers => [newTransfer, ...prevTransfers]);
        setIsModalOpen(false);
    };

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Stock Transfer History</h2>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                        Initiate Transfer
                    </button>
                </div>
                <DataTable columns={columns} data={transfers} />
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate a New Stock Transfer">
                <StockTransferForm onClose={() => setIsModalOpen(false)} onSave={handleSaveTransfer} />
            </Modal>
        </>
    );
};

export default StockTransfer;