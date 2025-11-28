// common/utils/mapping.ts

export interface ColumnMap {
  [key: string]: string; // systemField: uploadedColumn
}

// Utility to automatically map system fields to uploaded columns by name
// (Removed duplicate implementation)

// Detect which uploaded columns match system fields
export function autoMapColumns(systemFields: string[], uploadedColumns: string[]) {
  const mapping: Record<string, string> = {};
  systemFields.forEach(field => {
    const match = uploadedColumns.find(
      col => col.toLowerCase().replace(/\s+/g, "") === field.toLowerCase().replace(/\s+/g, "")
    );
    mapping[field] = match || "";
  });

  return mapping;
}
