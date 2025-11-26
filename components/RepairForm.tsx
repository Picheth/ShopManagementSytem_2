import React, { useState, useEffect } from 'react';
import type { RepairJob, RepairStatus, User } from '../types';

interface RepairFormProps {
  onClose: () => void;
  onSave: (repairJob: RepairJob) => void;
  repairJob: RepairJob | null;
  technicians: User[];
}

const RepairForm: React.FC<RepairFormProps> = ({ onClose, onSave, repairJob, technicians }) => {
    const [formData, setFormData] = useState<Partial<RepairJob>>({
        customerName: '',
        customerPhone: '',
        deviceModel: '',
        deviceImei: '',
        reportedIssue: '',
        technicianId: '',
        status: 'Received',
        receivedDate: new Date().toISOString().split('T')[0],
        cost: 0,
        notes: '',
    });

    useEffect(() => {
        if (repairJob) {
            setFormData(repairJob);
        }
    }, [repairJob]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Add validation here
        onSave(formData as RepairJob);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium text-text-main border-b pb-2">Customer & Device</h3>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
                    <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
                </div>
                 <div>
                    <label htmlFor="deviceModel" className="block text-sm font-medium text-gray-700">Device Model</label>
                    <input type="text" name="deviceModel" value={formData.deviceModel} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
                </div>
                 <div>
                    <label htmlFor="deviceImei" className="block text-sm font-medium text-gray-700">IMEI / Serial Number</label>
                    <input type="text" name="deviceImei" value={formData.deviceImei} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
                </div>
            </div>
             <div>
                <label htmlFor="reportedIssue" className="block text-sm font-medium text-gray-700">Reported Issue</label>
                <textarea name="reportedIssue" value={formData.reportedIssue} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required></textarea>
            </div>
            
            <h3 className="text-lg font-medium text-text-main border-b pb-2 pt-4">Job Details</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="receivedDate" className="block text-sm font-medium text-gray-700">Received Date</label>
                    <input type="date" name="receivedDate" value={formData.receivedDate} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" required />
                </div>
                <div>
                    <label htmlFor="estimatedCompletionDate" className="block text-sm font-medium text-gray-700">Est. Completion Date</label>
                    <input type="date" name="estimatedCompletionDate" value={formData.estimatedCompletionDate || ''} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        {(['Received', 'Diagnosing', 'Awaiting Parts', 'In Progress', 'Ready for Pickup', 'Completed', 'Cancelled'] as RepairStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="technicianId" className="block text-sm font-medium text-gray-700">Assign Technician</label>
                    <select name="technicianId" value={formData.technicianId} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
                        <option value="">Unassigned</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700">Estimated Cost ($)</label>
                    <input type="number" name="cost" value={formData.cost} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" min="0" step="0.01" />
                </div>
            </div>
             <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Technician Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"></textarea>
            </div>

             <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">
                    {repairJob ? 'Save Changes' : 'Create Job'}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default RepairForm;