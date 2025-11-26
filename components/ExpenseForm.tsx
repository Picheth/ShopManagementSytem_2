import React, { useState, useMemo, useEffect } from 'react';
import type { Expense } from '../types';

interface ExpenseFormProps {
  onClose: () => void;
  allExpenses: Expense[];
  onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
  defaultParentId?: string;
  expenseToEdit?: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onClose, allExpenses, onSave, defaultParentId, expenseToEdit }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState(0);
  const [status, setStatus] = useState<'Paid' | 'Unpaid'>('Paid');
  const [parentId, setParentId] = useState(defaultParentId || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isEditing = !!expenseToEdit;

  useEffect(() => {
    if (expenseToEdit) {
        setDate(expenseToEdit.date);
        setCategory(expenseToEdit.category);
        setPayee(expenseToEdit.payee);
        setAmount(expenseToEdit.amount);
        setStatus(expenseToEdit.status);
        setParentId(expenseToEdit.parentId || '');
    } else {
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('');
        setPayee('');
        setAmount(0);
        setStatus('Paid');
        setParentId(defaultParentId || '');
    }
  }, [expenseToEdit, defaultParentId]);

  const parentCategories = useMemo(() => {
    return allExpenses.filter(e => !e.parentId && e.id !== expenseToEdit?.id);
  }, [allExpenses, expenseToEdit]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!date) newErrors.date = 'Date is required.';
    if (!category.trim()) newErrors.category = 'Category name is required.';
    if (!payee.trim() && !parentId) newErrors.payee = 'Payee is required for top-level expenses.';
    if (amount <= 0 && !parentId) newErrors.amount = 'Amount must be greater than 0 for parent categories.';
    if (amount < 0) newErrors.amount = 'Amount cannot be negative.';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
        const expensePayload: Omit<Expense, 'id'> = { date, category, payee, amount, status, parentId: parentId || undefined };
        if (isEditing) {
            onSave({ ...expenseToEdit, ...expensePayload });
        } else {
            onSave(expensePayload);
        }
    }
  };

  const getInputClasses = (fieldName: string) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm ${errors[fieldName] ? 'border-red-500' : ''}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className={getInputClasses('date')} required />
        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
      </div>
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">Parent Category (Optional)</label>
        <select id="parentId" value={parentId} onChange={e => setParentId(e.target.value)} className={getInputClasses('parentId')}>
            <option value="">None (Create a new main category)</option>
            {parentCategories.map(parent => (
                <option key={parent.id} value={parent.id}>{parent.category}</option>
            ))}
        </select>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">{parentId ? 'Sub-Category Name' : 'Category Name'}</label>
        <input type="text" id="category" value={category} onChange={e => setCategory(e.target.value)} placeholder={parentId ? "e.g., Online Advertising" : "e.g., Marketing"} className={getInputClasses('category')} required />
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>
      <div>
        <label htmlFor="payee" className="block text-sm font-medium text-gray-700">Payee</label>
        <input type="text" id="payee" value={payee} onChange={e => setPayee(e.target.value)} placeholder="e.g., Office Supplies Co." className={getInputClasses('payee')} required={!parentId} />
        {errors.payee && <p className="text-red-500 text-xs mt-1">{errors.payee}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount ($)</label>
          <input type="number" id="amount" value={amount} onChange={e => setAmount(Number(e.target.value))} className={getInputClasses('amount')} min="0" step="0.01" required />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" value={status} onChange={e => setStatus(e.target.value as any)} className={getInputClasses('status')}>
            <option>Paid</option>
            <option>Unpaid</option>
          </select>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse">
        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">
          {isEditing ? 'Save Changes' : 'Save Expense'}
        </button>
        <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;