import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import Card from './Card';
import Modal from './Modal';
import RepairForm from './RepairForm';
import { MOCK_REPAIRS_DATA } from '../src/data/mockData';
import { MOCK_STAFF_DATA } from '../src/data/mockData';
import type { RepairJob, User, ColumnDefinition, RepairStatus } from '../types';

const Repairs: React.FC = () => {
    const [repairs, setRepairs] = useState<RepairJob[]>(MOCK_REPAIRS_DATA);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState<RepairJob | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RepairStatus | 'All'>('All');

    const technicians = useMemo(() => MOCK_STAFF_DATA.filter(user => user.role === 'Technician' || user.role === 'Admin'), []);
    const techniciansMap = useMemo(() => new Map(technicians.map(t => [t.id, t.name])), [technicians]);

    const handleEdit = (repair: RepairJob) => {
        setSelectedRepair(repair);
        setIsFormModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedRepair(null);
        setIsFormModalOpen(true);
    };

    const handleSave = (repairData: RepairJob) => {
        if (repairData.id && repairs.some(r => r.id === repairData.id)) {
            // Update existing
            setRepairs(repairs.map(r => r.id === repairData.id ? repairData : r));
        } else {
            // Add new
            const newRepair = { ...repairData, id: `REP-${String(repairs.length + 1).padStart(5, '0')}` };
            setRepairs([newRepair, ...repairs]);
        }
        setIsFormModalOpen(false);
    };

    const columns: ColumnDefinition<RepairJob>[] = [
        { header: 'Job ID', accessor: 'id', sortable: true },
        { 
            header: 'Customer & Device', 
            accessor: 'customerName', 
            render: (_, row) => (
                <div>
                    <div className="font-medium text-text-main">{row.customerName}</div>
                    <div className="text-xs text-text-light">{row.deviceModel} ({row.deviceImei})</div>
                </div>
            )
        },
        { header: 'Received Date', accessor: 'receivedDate', sortable: true },
        { 
            header: 'Technician', 
            accessor: 'technicianId',
            render: (_, row) => row.technicianId ? techniciansMap.get(row.technicianId) || 'Unassigned' : 'Unassigned'
        },
        { header: 'Cost', accessor: 'cost', render: (val) => `$${Number(val).toFixed(2)}`, sortable: true },
        { 
          header: 'Status', 
          accessor: 'status',
          sortable: true,
          render: (status) => {
            const statusVal = String(status) as RepairStatus;
            const statusClasses = {
                Received: 'bg-gray-100 text-gray-800',
                Diagnosing: 'bg-blue-100 text-blue-800',
                'Awaiting Parts': 'bg-yellow-100 text-yellow-800',
                'In Progress': 'bg-indigo-100 text-indigo-800',
                'Ready for Pickup': 'bg-purple-100 text-purple-800',
                Completed: 'bg-green-100 text-green-800',
                Cancelled: 'bg-red-100 text-red-800',
            };
            return (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[statusVal]}`}>
                {statusVal}
              </span>
            );
          }
        },
         {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
                <button 
                    onClick={() => handleEdit(row)}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                >
                    View / Edit
                </button>
            )
        }
    ];

    const filteredAndSortedData = useMemo(() => {
        let data = repairs.filter(repair => {
            const search = searchTerm.toLowerCase();
            const matchesSearch = !search ||
                repair.id.toLowerCase().includes(search) ||
                repair.customerName.toLowerCase().includes(search) ||
                repair.deviceModel.toLowerCase().includes(search) ||
                repair.deviceImei.toLowerCase().includes(search);
            
            const matchesStatus = statusFilter === 'All' || repair.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Add sorting later if needed
        return data;
    }, [repairs, searchTerm, statusFilter]);
    
    const summaryCards = useMemo(() => {
        const inProgress = repairs.filter(r => ['Diagnosing', 'Awaiting Parts', 'In Progress'].includes(r.status)).length;
        const ready = repairs.filter(r => r.status === 'Ready for Pickup').length;
        const completedThisMonth = repairs.filter(r => {
            const completedDate = new Date(r.receivedDate); // Approximation
            const today = new Date();
            return r.status === 'Completed' && completedDate.getMonth() === today.getMonth() && completedDate.getFullYear() === today.getFullYear();
        }).length;
        
        return { inProgress, ready, completedThisMonth };
    }, [repairs]);

    return (
        <>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card title="In Progress" value={String(summaryCards.inProgress)} change="Active jobs" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.471-2.471a.563.563 0 01.801 0l3.535 3.535a.563.563 0 010 .801l-2.471 2.471m-4.586-4.586l2.471-2.471a.563.563 0 01.801 0l3.535 3.535a.563.563 0 010 .801l-2.471 2.471m0 0a2.25 2.25 0 11-3.182-3.182 2.25 2.25 0 013.182 0z" /></svg>} />
                    <Card title="Ready for Pickup" value={String(summaryCards.ready)} change="Awaiting customer" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.117 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.116 1.007zM8.25 10.5a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V11.25a.75.75 0 01.75-.75zm4.5 0a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V11.25a.75.75 0 01.75-.75z" /></svg>} />
                    <Card title="Completed This Month" value={String(summaryCards.completedThisMonth)} change="Jobs finished" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                </div>
                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Repair Jobs</h2>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                            <div className="w-full sm:w-auto">
                                <label htmlFor="status-filter" className="sr-only">Filter by status</label>
                                <select
                                    id="status-filter"
                                    className="block w-full appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 leading-5 text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as RepairStatus | 'All')}
                                >
                                    <option value="All">All Statuses</option>
                                    {(['Received', 'Diagnosing', 'Awaiting Parts', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'] as RepairStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by customer, device..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleAddNew}
                                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0"
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                Add New Job
                            </button>
                        </div>
                    </div>
                    <DataTable columns={columns} data={filteredAndSortedData} />
                </div>
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedRepair ? `Edit Repair Job: ${selectedRepair.id}` : "Add New Repair Job"}>
                <RepairForm
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleSave}
                    repairJob={selectedRepair}
                    technicians={technicians}
                />
            </Modal>
        </>
    );
};

export default Repairs;