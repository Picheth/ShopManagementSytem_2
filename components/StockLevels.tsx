import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import Card from './Card';
import { MOCK_INVENTORY_DATA } from '../src/data/mockData';
import type { InventoryItem, ColumnDefinition } from '../types';

const LOW_STOCK_THRESHOLD = 20;

const StockLevels: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredData = useMemo(() => {
        if (!searchTerm) {
            return MOCK_INVENTORY_DATA;
        }
        return MOCK_INVENTORY_DATA.filter(item =>
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const lowStockCount = useMemo(() => {
        return MOCK_INVENTORY_DATA.filter(item => item.quantity < LOW_STOCK_THRESHOLD).length;
    }, [MOCK_INVENTORY_DATA]);

    const columns: ColumnDefinition<InventoryItem>[] = [
        { 
            header: 'Product Name', 
            accessor: 'productName',
            render: (name, row) => (
                <div>
                    <div className="font-medium text-text-main">{String(name)}</div>
                    <div className="text-xs text-text-light">SKU: {row.sku}</div>
                </div>
            )
        },
        { header: 'Location', accessor: 'location' },
        { 
          header: 'Quantity', 
          accessor: 'quantity',
          render: (qty) => (
            <span className={Number(qty) < LOW_STOCK_THRESHOLD ? 'text-red-500 font-bold' : 'text-text-main'}>
                {String(qty)} units
            </span>
          )
        },
    ];
    
    const getRowClassName = (item: InventoryItem) => {
        return item.quantity < LOW_STOCK_THRESHOLD ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50';
    };

    return (
        <div className="space-y-6">
            <Card 
                title="Items Low on Stock"
                value={String(lowStockCount)}
                change={`Threshold: < ${LOW_STOCK_THRESHOLD} units`}
                changeType="decrease"
                icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
            />
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Current Stock Levels</h2>
                    <div className="relative w-full sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    rowClassName={getRowClassName}
                />
            </div>
        </div>
    );
};

export default StockLevels;