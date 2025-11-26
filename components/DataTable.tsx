import React from 'react';
import type { ColumnDefinition } from '../types';

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  sortKey?: keyof T | null;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: keyof T) => void;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

const SortIcon: React.FC<{ direction?: 'asc' | 'desc' | null }> = ({ direction }) => {
    if (direction === 'asc') return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>;
    if (direction === 'desc') return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
    return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
}

const DataTable = <T extends { id: string },>(
  { columns, data, sortKey, sortDirection, onSort, rowClassName, onRowClick }: DataTableProps<T>
) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => {
                const isSortable = col.sortable && onSort;
                const isSorted = sortKey === col.accessor;

                return (
                    <th
                        key={col.header}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider"
                        onClick={() => isSortable && onSort(col.accessor)}
                        style={{ cursor: isSortable ? 'pointer' : 'default' }}
                    >
                        <div className="flex items-center gap-2">
                            {col.header}
                            {isSortable && (
                                <SortIcon direction={isSorted ? sortDirection : null} />
                            )}
                        </div>
                    </th>
                );
            })}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-gray-200">
          {data.map((row) => (
            <tr 
              key={row.id} 
              className={`transition-colors duration-200 ${rowClassName ? rowClassName(row) : 'hover:bg-gray-50'} ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={`${row.id}-${String(col.accessor)}`} className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                  {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;