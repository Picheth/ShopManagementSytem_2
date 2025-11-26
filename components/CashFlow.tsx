import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './Card';
import { MOCK_CASH_FLOW_DATA } from '../data/mockData';
import type { CashFlowActivity } from '../types';

const cashFlowChartData = [
  { name: 'Jul', Inflow: 18000, Outflow: 15500 },
  { name: 'Aug', Inflow: 22000, Outflow: 19800 },
  { name: 'Sep', Inflow: 25000, Outflow: 21200 },
  { name: 'Oct', Inflow: 21500, Outflow: 23400 },
];

const CashFlow: React.FC = () => {
    const [expandedSections, setExpandedSections] = useState({
        operating: true,
        investing: true,
        financing: true,
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const { inflows, outflows, netCashFlow, activities } = useMemo(() => {
        let totalInflows = 0;
        let totalOutflows = 0;
        const categorizedActivities = {
            Operating: MOCK_CASH_FLOW_DATA.filter(a => a.category === 'Operating'),
            Investing: MOCK_CASH_FLOW_DATA.filter(a => a.category === 'Investing'),
            Financing: MOCK_CASH_FLOW_DATA.filter(a => a.category === 'Financing'),
        };

        MOCK_CASH_FLOW_DATA.forEach(activity => {
            if (activity.type === 'inflow') {
                totalInflows += activity.amount;
            } else {
                totalOutflows += activity.amount;
            }
        });

        return {
            inflows: totalInflows,
            outflows: totalOutflows,
            netCashFlow: totalInflows - totalOutflows,
            activities: categorizedActivities,
        };
    }, []);
    
    const formatCurrency = (value: number) => {
        const isNegative = value < 0;
        const formatted = Math.abs(value).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });
        return isNegative ? `(${formatted})` : formatted;
    };
    
    const renderActivitySection = (title: string, data: CashFlowActivity[], sectionKey: keyof typeof expandedSections) => {
        const total = data.reduce((sum, item) => sum + (item.type === 'inflow' ? item.amount : -item.amount), 0);
        const isExpanded = expandedSections[sectionKey];

        return (
            <div className="border-b border-gray-200">
                <div 
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleSection(sectionKey)}
                    aria-expanded={isExpanded}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <h4 className="font-semibold text-lg text-text-main">{title}</h4>
                    </div>
                    <span className={`font-semibold text-lg ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(total)}</span>
                </div>
                {isExpanded && (
                    <div className="pl-8 pb-4 space-y-2">
                        {data.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
                                <div>
                                    <p className="text-text-main">{item.description}</p>
                                    <p className="text-text-light text-xs">{item.date}</p>
                                </div>
                                <span className={item.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                                    {item.type === 'inflow' ? formatCurrency(item.amount) : `(${formatCurrency(item.amount)})`}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Total Cash In" value={formatCurrency(inflows)} change="+15% vs last month" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <Card title="Total Cash Out" value={formatCurrency(outflows)} change="+12% vs last month" changeType="decrease" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>} />
                <Card title="Net Cash Flow" value={formatCurrency(netCashFlow)} change={netCashFlow >= 0 ? 'Positive flow' : 'Negative flow'} changeType={netCashFlow >= 0 ? 'increase' : 'decrease'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Cash Flow Statement</h3>
                    <div className="space-y-2">
                        {renderActivitySection('Cash Flow from Operating Activities', activities.Operating, 'operating')}
                        {renderActivitySection('Cash Flow from Investing Activities', activities.Investing, 'investing')}
                        {renderActivitySection('Cash Flow from Financing Activities', activities.Financing, 'financing')}
                    </div>
                     <div className="flex justify-between items-center p-4 mt-4 bg-background rounded-md">
                        <h4 className="font-bold text-xl text-text-main">Net Increase/Decrease in Cash</h4>
                        <span className={`font-bold text-xl ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(netCashFlow)}</span>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow Trend</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={cashFlowChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                            <Tooltip formatter={(value: number) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="Inflow" fill="#10B981" />
                            <Bar dataKey="Outflow" fill="#EF4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default CashFlow;