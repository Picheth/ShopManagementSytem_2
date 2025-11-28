import React, { useState } from "react";
import ColumnMappingModal from "../ColumnMappingModal";
import { autoMapColumns } from "../../utils/mapping";
import { exportCSV, exportExcel } from '../../utils/csvExcel'; // your existing parse helpers
// Update the import path to the correct location of excelParser
import { parseExcelFile } from '../../utils/excelParser'; // adjust path/module as needed
import { validateRows } from "../utils/validation"; // wrapper around zod safeParse + result format
import { ImportPreviewModal } from '../components/ImportPreviewModal';

type GenericImportProps<T> = {
  moduleName: string; // "products" etc
  systemFields: string[]; // required order/names: ["sku","name","price"...]
  schema: any; // Zod schema for validation
  onImport: (rows: T[]) => Promise<void>; // method to insert rows (Firestore add)
  templateFields?: string[]; // fields to include in template
};

export function parseCSVFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      resolve(rows);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export default function GenericImport<T>({ moduleName, systemFields, schema, onImport, templateFields }: GenericImportProps<T>) {
  const [showMapping, setShowMapping] = useState(false);
  const [mapping, setMapping] = useState<Record<string,string>>({});
  const [uploadedColumns, setUploadedColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);

  const handleFile = async (file: File) => {
    let parsed: any[] = [];
    if (file.name.endsWith(".csv")) parsed = await parseCSVFile(file);
    else parsed = await parseExcelFile(file);

    if (!parsed.length) {
      alert("No rows found in file.");
      return;
    }

    const cols = Object.keys(parsed[0]);
    setUploadedColumns(cols);

    const auto = autoMapColumns(systemFields, cols);
    setMapping(auto);

    // if mapping incomplete or there are unmatched columns -> show mapping UI
    const unmappedRequired = systemFields.filter(f => !auto[f]);
    setRawRows(parsed);

    if (unmappedRequired.length > 0) setShowMapping(true);
    else {
      // remap and continue to validation
      const remapped = remapRows(parsed, auto);
      continueValidation(remapped);
    }
  };

  function remapRows(rows: any[], map: Record<string,string>) {
    return rows.map(r => {
      const out: any = {};
      Object.entries(map).forEach(([sys, col]) => { out[sys] = r[col]; });
      // include any columns not in mapping as extra if needed
      return out;
    });
  }

  function continueValidation(rows: any[]) {
    const { valid, invalid } = validateRows(rows, schema);
    setValidRows(valid);
    setInvalidRows(invalid);
    setPreviewOpen(true);
  }

  function onMappingConfirm() {
    setShowMapping(false);
    const remapped = remapRows(rawRows, mapping);
    continueValidation(remapped);
  }

  async function confirmImport() {
    try {
      await onImport(validRows);
      alert(`Imported ${validRows.length} ${moduleName}`);
      setPreviewOpen(false);
    } catch (err) {
      console.error(err);
      alert("Import failed. Check console.");
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input type="file" accept=".csv,.xlsx,.xls" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      </div>

      <ColumnMappingModal
        isOpen={showMapping}
        onClose={() => setShowMapping(false)}
        systemFields={systemFields}
        uploadedColumns={uploadedColumns}
        mapping={mapping}
        setMapping={setMapping}
        onConfirm={onMappingConfirm}
      />

      <ImportPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        validRows={validRows}
        invalidRows={invalidRows}
        onConfirm={confirmImport}
      />
    </div>
  );
}
