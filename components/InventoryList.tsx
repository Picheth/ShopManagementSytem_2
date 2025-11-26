
import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import StockAdjustmentForm from './StockAdjustmentForm';
import InventoryItemForm from './InventoryItemForm';
import LowStockAlerts from './LowStockAlerts';
import { MOCK_INVENTORY_DATA, MOCK_BRANCHES_DATA } from '../data/mockData';
import type { InventoryItem, ColumnDefinition } from '../types';

const LOW_STOCK_THRESHOLD = 20;

const InventoryList: React.FC = () => {
    const [inventoryData, setInventoryData] = useState<InventoryItem[]>(MOCK_INVENTORY_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [branchFilter, setBranchFilter] = useState<string>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [selectedItemForAdjustment, setSelectedItemForAdjustment] = useState<InventoryItem | null>(null);

    const handleOpenAdjustModal = (item: InventoryItem) => {
        setSelectedItemForAdjustment(item);
        setIsAdjustModalOpen(true);
    };

    const handleCloseAdjustModal = () => {
        setIsAdjustModalOpen(false);
        setSelectedItemForAdjustment(null);
    };

    const handleSaveAdjustment = (itemId: string, newQuantity: number, reason: string, notes: string) => {
        setInventoryData(prevData =>
            prevData.map(item =>
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
        handleCloseAdjustModal();
    };
    
    const handleSaveNewItem = (newItemData: Omit<InventoryItem, 'id'>) => {
        const newItem: InventoryItem = {
            ...newItemData,
            id: `INV${(inventoryData.length + 1).toString().padStart(3, '0')}`,
            lastStockCountDate: new Date().toISOString().split('T')[0]
        };
        setInventoryData(prev => [newItem, ...prev]);
        setIsAddItemModalOpen(false);
    };

    const columns: ColumnDefinition<InventoryItem>[] = [
        { 
            header: 'Product Name', 
            accessor: 'productName',
            render: (name, row) => (
                <div>
                    <div className="font-medium text-text-main">{String(name)}</div>
                    {row.sku && <div className="text-xs text-text-light">SKU: {row.sku}</div>}
                </div>
            )
        },
        { header: 'Category', accessor: 'category' },
        { 
          header: 'Quantity', 
          accessor: 'quantity',
          render: (qtyValue) => {
            const qty = Number(qtyValue);
            return (
              <span className={qty < LOW_STOCK_THRESHOLD ? 'text-red-500 font-bold' : ''}>{String(qtyValue)}</span>
            )
          }
        },
        { 
          header: 'Stock Count Date', 
          accessor: 'lastStockCountDate', 
          render: (date) => date ? String(date) : 'N/A' 
        },
        { header: 'Location', accessor: 'location' },
        { header: 'Cost', accessor: 'costPrice', render: (val) => `$${Number(val).toFixed(2)}` },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
                <div className="space-x-2">
                    <button className="text-primary hover:text-primary-dark text-sm font-medium">Edit</button>
                    <button 
                        onClick={() => handleOpenAdjustModal(row)}
                        className="text-yellow-500 hover:text-yellow-600 text-sm font-medium">
                        Adjust Stock
                    </button>
                </div>
            )
        }
    ];

    const categories: InventoryItem['category'][] = ['Phone', 'Accessory', 'Repair Part', 'Tablet'];

    const filteredData = useMemo(() => {
        let data = inventoryData;

        if (branchFilter !== 'All') {
            data = data.filter(item => item.location === branchFilter);
        }

        if (categoryFilter !== 'All') {
            data = data.filter(item => item.category === categoryFilter);
        }

        if (searchTerm) {
            data = data.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }
        return data;
    }, [searchTerm, inventoryData, branchFilter, categoryFilter]);
    
    const getRowClassName = (item: InventoryItem) => {
        return item.quantity < LOW_STOCK_THRESHOLD ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50';
    };


    return (
        <>
            <div className="space-y-6">
                <LowStockAlerts />
                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Inventory List</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                            <div className="w-full sm:w-auto">
                                 <label htmlFor="branch-filter" className="sr-only">Filter by branch</label>
                                <select
                                    id="branch-filter"
                                    className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    value={branchFilter}
                                    onChange={(e) => setBranchFilter(e.target.value)}
                                >
                                    <option value="All">All Locations</option>
                                    {MOCK_BRANCHES_DATA.map(branch => (
                                        <option key={branch.id} value={branch.name}>{branch.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full sm:w-auto">
                                 <label htmlFor="category-filter" className="sr-only">Filter by category</label>
                                <select
                                    id="category-filter"
                                    className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                >
                                    <option value="All">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative w-full sm:w-64">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search inventory..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => setIsAddItemModalOpen(true)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add Item
                            </button>
                        </div>
                    </div>
                    <DataTable columns={columns} data={filteredData} rowClassName={getRowClassName} />
                </div>
            </div>
            
            <Modal isOpen={isAdjustModalOpen} onClose={handleCloseAdjustModal} title={`Adjust Stock: ${selectedItemForAdjustment?.productName}`}>
                <StockAdjustmentForm
                    item={selectedItemForAdjustment}
                    onClose={handleCloseAdjustModal}
                    onSave={handleSaveAdjustment}
                />
            </Modal>
            
            <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Add New Inventory Item">
                <InventoryItemForm
                    onClose={() => setIsAddItemModalOpen(false)}
                    onSave={handleSaveNewItem}
                />
            </Modal>
        </>
    );
};

export default InventoryList;
