import React from 'react';
import { MOCK_INVENTORY_DATA } from '../src/data/mockData';

const LOW_STOCK_THRESHOLD = 20;

const LowStockAlerts: React.FC = () => {
  const lowStockItems = MOCK_INVENTORY_DATA.filter(
    (item) => item.quantity < LOW_STOCK_THRESHOLD
  );

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.031-1.742 3.031H4.42c-1.532 0-2.492-1.697-1.742-3.031l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-yellow-800">
            Low Stock Alerts ({lowStockItems.length} items)
          </p>
          <div className="mt-2 text-sm text-yellow-700">
            <ul className="list-disc space-y-1 pl-5">
              {lowStockItems.map((item) => (
                <li key={item.id}>
                  <strong>{item.productName}</strong> has only <span className="font-bold">{item.quantity}</span> units left.
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LowStockAlerts;
