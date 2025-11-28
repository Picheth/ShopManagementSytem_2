// src/common/utils/mapping.ts

export interface ColumnMap {
  [key: string]: string; // systemField: uploadedColumn
}

// Detect which uploaded columns match system fields
export function autoMapColumns(systemFields: string[], uploadedColumns: string[]) {
  const mapping: ColumnMap = {};

  systemFields.forEach(field => {
    const match = uploadedColumns.find(
      col =>
        col.toLowerCase().replace(/\s+/g, '') ===
        field.toLowerCase().replace(/\s+/g, '')
    );

    if (match) mapping[field] = match;
  });

  return mapping;
}
