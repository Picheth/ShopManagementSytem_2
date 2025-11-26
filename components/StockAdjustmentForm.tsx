import React, { useState, useEffect } from 'react';
import type { InventoryItem } from '../types';

interface StockAdjustmentFormProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (itemId: string, newQuantity: number, reason: string, notes: string) => void;
}

const StockAdjustmentForm: React.FC<StockAdjustmentFormProps> = ({ item, onClose, onSave }) => {
  const [newQuantity, setNewQuantity] = useState(item?.quantity || 0);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setNewQuantity(item.quantity);
      setReason('');
      setNotes('');
      setError('');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuantity < 0) {
      setError('New quantity cannot be negative.');
      return;
    }
    if (!reason) {
      setError('A reason for adjustment is required.');
      return;
    }
    setError('');
    onSave(item.id, newQuantity, reason, notes);
  };

  const quantityChange = newQuantity - item.quantity;
  const changeColor = quantityChange > 0 ? 'text-green-600' : quantityChange < 0 ? 'text-red-600' : 'text-gray-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-md bg-gray-50 space-y-2">
        <p className="font-semibold text-text-main">{item.productName}</p>
        <p className="text-xs text-text-light">SKU: {item.sku} | Location: {item.location}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 items-center text-center p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-500">Current</label>
          <p className="text-2xl font-bold text-text-main">{item.quantity}</p>
        </div>
        <div className={`text-2xl font-bold ${changeColor}`}>
            {quantityChange > 0 ? `+${quantityChange}` : quantityChange < 0 ? `${quantityChange}` : 'No Change'}
        </div>
        <div>
          <label htmlFor="newQuantity" className="block text-sm font-medium text-gray-700">New Quantity</label>
          <input
            id="newQuantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseInt(e.target.value, 10) || 0)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-center font-bold text-xl py-1"
            required
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason</label>
        <select
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
          required
        >
          <option value="">-- Select a reason --</option>
          <option value="Stock Count Correction">Stock Count Correction</option>
          <option value="Damaged Goods">Damaged Goods</option>
          <option value="Return from Customer">Return from Customer</option>
          <option value="Lost / Stolen">Lost / Stolen</option>
          <option value="Initial Stock Entry">Initial Stock Entry</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
          placeholder="Add any extra details..."
        ></textarea>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
        <button
          type="submit"
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm"
        >
          Save Adjustment
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;