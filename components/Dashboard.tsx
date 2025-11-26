import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from './Card';
import DataTable from './DataTable';
import LowStockAlerts from './LowStockAlerts';
import type { Sale, ColumnDefinition } from '../types';
import { onSnapshot } from './database';

const salesChartData = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

const topProductsData = [
    { name: 'iPhone 15 Pro', sold: 120 },
    { name: 'Galaxy S23', sold: 98 },
    { name: 'USB-C Cable', sold: 350 },
    { name: 'Screen Protector', sold: 420 },
    { name: 'Repair Service', sold: 75 },
]

const cardData = [
  { title: "Today's Revenue", value: '$1,245', change: '+11.5%', changeType: 'increase' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0h.75A.75.75 0 016.75 6v-.75m0 0h.75A.75.75 0 018.25 6v.75m0 0h.75a.75.75 0 01.75-.75V5.25m0 0h.75A.75.75 0 0111.25 6v.75m0 0h.75a.75.75 0 01.75-.75V5.25m0 0h.75A.75.75 0 0113.5 6v.75m0 0h.75a.75.75 0 01.75-.75V5.25m0 0h.75a.75.75 0 01.75.75v.75m3 12.75H2.25" /></svg> },
  { title: 'Total Orders', value: '82', change: '-2.1%', changeType: 'decrease' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
  { title: 'Pending Repairs', value: '12', change: '+5', changeType: 'increase' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a.563.563 0 01.801 0l3.535 3.535a.563.563 0 010 .801l-2.471 2.471m-4.586-4.586l2.471-2.471a.563.563 0 01.801 0l3.535 3.535a.563.563 0 010 .801l-2.471 2.471m0 0a2.25 2.25 0 11-3.182-3.182 2.25 2.25 0 013.182 0z" /></svg> },
  { title: 'Inventory Value', value: '$125.4k', change: '+0.8%', changeType: 'increase' as const, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.826-1.106-2.156 0-2.982l.879-.659m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> },
];

const salesColumns: ColumnDefinition<Sale>[] = [
    { header: 'Order ID', accessor: 'orderId' },
    { header: 'Date', accessor: 'date' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total', accessor: 'total', render: (val) => `$${Number(val).toFixed(2)}` },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (statusValue) => {
        const status = String(statusValue);
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            status === 'Paid' ? 'bg-green-100 text-green-800' :
            status === 'Unpaid' ? 'bg-yellow-100 text-yellow-800' :
            status === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        );
      }
    },
];

const Dashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [isLoadingSales, setIsLoadingSales] = useState(true);

  useEffect(() => {
      setIsLoadingSales(true);
      const unsubscribe = onSnapshot("sales", 
        { limit: 5, orderBy: 'date', direction: 'desc' },
        (snapshot) => {
            const salesList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[];
            setSalesData(salesList);
            setIsLoadingSales(false);
        }, (error) => {
            console.error("Error fetching sales data: ", error);
            setIsLoadingSales(false);
        }
      );

      return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <LowStockAlerts />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardData.map(card => <Card key={card.title} {...card} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-card p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Weekly Sales Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#10B981" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}}/>
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sold" fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
        {isLoadingSales ? (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        ) : (
            <DataTable columns={salesColumns} data={salesData} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;