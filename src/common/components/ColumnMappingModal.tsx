import React from "react";

interface ColumnMappingModalProps {
  open: boolean;
  onClose: () => void;
  mapping: Record<string, string>;
  onChange: (mapping: Record<string, string>) => void;
  systemFields: string[];
  uploadedColumns: string[];
}

const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  open,
  onClose,
  mapping,
  onChange,
  systemFields,
  uploadedColumns,
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Map Columns</h2>
        <table>
          <thead>
            <tr>
              <th>System Field</th>
              <th>Uploaded Column</th>
            </tr>
          </thead>
          <tbody>
            {systemFields.map((field) => (
              <tr key={field}>
                <td>{field}</td>
                <td>
                  <select
                    value={mapping[field] || ""}
                    onChange={(e) =>
                      onChange({ ...mapping, [field]: e.target.value })
                    }
                  >
                    <option value="">-- None --</option>
                    {uploadedColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ColumnMappingModal;
