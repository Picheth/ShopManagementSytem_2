import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import Card from './Card';
import DataTable from './DataTable';
import { MOCK_INVENTORY_DATA } from '../data/mockData';
import type { InventoryItem, ColumnDefinition } from '../types';

// Define an extended type for our internal use
interface AgedInventoryItem extends InventoryItem {
    id: string; // Ensure id is present for DataTable key
    daysInStock: number;
    totalValue: number;
}

const STALE_THRESHOLD_DAYS = 90;
const AGING_BUCKETS = {
    '0-30 Days': { min: 0, max: 30 },
    '31-60 Days': { min: 31, max: 60 },
    '61-90 Days': { min: 61, max: 90 },
    '91-180 Days': { min: 91, max: 180 },
    '180+ Days': { min: 181, max: Infinity },
};

const BUCKET_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const InventoryAging: React.FC = () => {
    const [sortKey, setSortKey] = useState<keyof AgedInventoryItem | null>('daysInStock');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const processedData = useMemo(() => {
        const today = new Date();
        const agedInventory: AgedInventoryItem[] = MOCK_INVENTORY_DATA.map((item) => {
            let purchaseDate: Date;
            if (item.lastStockCountDate) {
                purchaseDate = new Date(item.lastStockCountDate);
            } else {
                // Simulate a purchase date for items without one by going back a random number of days from today
                const randomDaysAgo = Math.floor(Math.random() * 200) + 1; // 1 to 200 days
                purchaseDate = new Date();
                purchaseDate.setDate(today.getDate() - randomDaysAgo);
            }

            const diffTime = Math.abs(today.getTime() - purchaseDate.getTime());
            const daysInStock = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const totalValue = item.quantity * item.costPrice;

            return { ...item, daysInStock, totalValue };
        });

        const bucketValues = Object.fromEntries(Object.keys(AGING_BUCKETS).map(key => [key, 0]));
        let totalInventoryValue = 0;
        let totalWeightedAge = 0;
        let totalQuantity = 0;
        
        agedInventory.forEach(item => {
            totalInventoryValue += item.totalValue;
            totalWeightedAge += item.daysInStock * item.quantity;
            totalQuantity += item.quantity;

            for (const [bucketName, range] of Object.entries(AGING_BUCKETS)) {
                if (item.daysInStock >= range.min && item.daysInStock <= range.max) {
                    bucketValues[bucketName] += item.totalValue;
                    break;
                }
            }
        });

        const chartData = Object.entries(bucketValues).map(([name, value]) => ({ name, value }));
        const averageAge = totalQuantity > 0 ? totalWeightedAge / totalQuantity : 0;
        const staleItemsCount = agedInventory.filter(item => item.daysInStock > STALE_THRESHOLD_DAYS).length;

        return {
            agedInventory,
            chartData,
            totalInventoryValue,
            averageAge,
            staleItemsCount
        };
    }, []);
    
    const sortedInventory = useMemo(() => {
        const data = [...processedData.agedInventory];
        if (sortKey) {
            data.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];
                
                if (valA == valB) return 0;
                if (valA == null) return 1;
                if (valB == null) return -1;

                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }

                return sortDirection === 'desc' ? -comparison : comparison;
            });
        }
        return data;
    }, [processedData.agedInventory, sortKey, sortDirection]);

    const handleSort = (key: keyof AgedInventoryItem) => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const columns: ColumnDefinition<AgedInventoryItem>[] = [
        { header: 'Product Name', accessor: 'productName', render: (name, row) => (
            <div>
                <div className="font-medium text-text-main">{String(name)}</div>
                <div className="text-xs text-text-light">SKU: {row.sku}</div>
            </div>
        )},
        { header: 'Category', accessor: 'category', sortable: true },
        { header: 'Quantity', accessor: 'quantity', sortable: true },
        { header: 'Total Value', accessor: 'totalValue', render: val => `$${Number(val).toFixed(2)}`, sortable: true },
        { header: 'Days in Stock', accessor: 'daysInStock', sortable: true },
    ];

    const getRowClassName = (item: AgedInventoryItem) => {
        return item.daysInStock > STALE_THRESHOLD_DAYS ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50';
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                    title="Total Inventory Value" 
                    value={`$${processedData.totalInventoryValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                    change="Based on cost price"
                    changeType="increase"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.826-1.106-2.156 0-2.982l.879-.659m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
                />
                <Card 
                    title="Average Inventory Age" 
                    value={`${Math.round(processedData.averageAge)} Days`}
                    change="Weighted by quantity"
                    changeType="increase"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <Card 
                    title="Stale Items" 
                    value={String(processedData.staleItemsCount)}
                    change={`> ${STALE_THRESHOLD_DAYS} days in stock`}
                    changeType="decrease"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
                />
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Inventory Value by Aging Bucket</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData.chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={val => `$${(val / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="value" name="Inventory Value">
                            {processedData.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={BUCKET_COLORS[index % BUCKET_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Detailed Inventory Aging</h3>
                <DataTable 
                    columns={columns} 
                    data={sortedInventory} 
                    onSort={handleSort as (key: any) => void}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    rowClassName={getRowClassName}
                />
            </div>
        </div>
    );
};

export default InventoryAging;