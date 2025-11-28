// common/components/ColumnMappingModal.tsx

import React from "react";

export default function ColumnMappingModal({
  isOpen,
  onClose,
  systemFields,
  uploadedColumns,
  mapping,
  setMapping,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[480px] p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-bold mb-4">Match Columns</h2>

        <p className="text-sm text-gray-700 mb-4">
          Your uploaded file has different headers.  
          Please map columns to the system fields below:
        </p>

        <div className="space-y-3 max-h-[300px] overflow-auto">
          {systemFields.map((field) => (
            <div key={field} className="flex items-center gap-2">
              <span className="w-32 font-medium">{field}</span>

              <select
                className="flex-1 border rounded p-2"
                value={mapping[field] ?? ""}
                onChange={(e) =>
                  setMapping(prev => ({
                    ...prev,
                    [field]: e.target.value
                  }))
                }
              >
                <option value="">— Not Mapped —</option>
                {uploadedColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="px-4 py-2 border rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={onConfirm}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
