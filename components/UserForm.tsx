import React, { useState, useMemo, useEffect } from 'react';
import type { User } from '../types';
import { MOCK_BRANCHES_DATA } from '../src/data/mockData';

interface UserFormProps {
  onClose: () => void;
  currentUser: User;
  onSave: (user: Omit<User, 'id'>) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onClose, currentUser, onSave }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState<User['role']>('Sales Staff');
    const [status, setStatus] = useState<User['status']>('Active');
    const [branchId, setBranchId] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        // If the current user is a manager, automatically assign their branch
        if (currentUser.role === 'Manager') {
            setBranchId(currentUser.branchId);
        }
    }, [currentUser]);

    const availableRoles = useMemo(() => {
        if (currentUser.role === 'Admin') {
            return ['Admin', 'Manager', 'Sales Staff', 'Technician'] as User['role'][];
        }
        if (currentUser.role === 'Manager') {
            return ['Sales Staff', 'Technician'] as User['role'][];
        }
        return []; // No roles available for other users to assign
    }, [currentUser.role]);

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = 'Full name is required.';
        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email address is invalid.';
        }
        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long.';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }
        if (!branchId) newErrors.branchId = 'A branch must be assigned.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave({ name, email, role, status, branchId });
        }
    };
    
    const getInputClasses = (fieldName: string) => {
        let baseClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm";
        if (errors[fieldName]) {
            baseClasses += " border-red-500 focus:border-red-500 focus:ring-red-500";
        }
        return baseClasses;
    };

    const isManager = currentUser.role === 'Manager';

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className={getInputClasses('name')} placeholder="e.g., John Doe" required />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className={getInputClasses('email')} placeholder="e.g., john.d@phonestore.com" required />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className={getInputClasses('password')} required />
                     {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                 <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={getInputClasses('confirmPassword')} required />
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <select id="role" value={role} onChange={e => setRole(e.target.value as User['role'])} className={getInputClasses('role')}>
                        {availableRoles.map(r => (
                            <option key={r} value={r}>{r}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select id="status" value={status} onChange={e => setStatus(e.target.value as User['status'])} className={getInputClasses('status')}>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>
             <div>
                <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">Assign to Branch</label>
                <select 
                    id="branchId" 
                    value={branchId} 
                    onChange={e => setBranchId(e.target.value)} 
                    className={`${getInputClasses('branchId')} ${isManager ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    required
                    disabled={isManager}
                >
                    <option value="">Select a branch</option>
                    {MOCK_BRANCHES_DATA.map(branch => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                </select>
                {errors.branchId && <p className="text-red-500 text-xs mt-1">{errors.branchId}</p>}
            </div>

             <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm">
                    Create User
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default UserForm;
