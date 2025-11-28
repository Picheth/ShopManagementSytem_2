import React, { useState } from "react";
import { autoMapColumns } from "../../../common/utils/mapping";
import ColumnMappingModal from "../../../common/components/ColumnMappingModal";

const systemFields = ["sku", "name", "category", "brand", "price", "cost"];

export default function ProductImportPreview({ parsedData = [] }: { parsedData: Array<Record<string, any>> }) {
  const uploadedColumns = parsedData.length > 0 ? Object.keys(parsedData[0]) : [];
  const initialMapping = autoMapColumns(systemFields, uploadedColumns);

  const [mapping, setMapping] = useState(initialMapping);
  const [showMapping, setShowMapping] = useState(
    uploadedColumns.some(col => !Object.values(initialMapping).includes(col))
  );
  const [previewData, setPreviewData] = useState<Array<Record<string, any>>>([]);

  function handleMappingConfirm() {
    setShowMapping(false);
    const remapped = parsedData.map(row => {
      const newData: Record<string, any> = {};
      Object.entries(mapping).forEach(([sysField, uploadedCol]) => {
        newData[sysField] = row[uploadedCol as string] ?? "";
      });
      return newData;
    });
    setPreviewData(remapped);
  }

  return (
    <>
      {showMapping && (
        <ColumnMappingModal
          open={showMapping}
          onClose={() => setShowMapping(false)}
          systemFields={systemFields}
          uploadedColumns={uploadedColumns}
          mapping={mapping}
          onChange={setMapping}
        />
      )}
      {/* Add preview table or UI for previewData here */
      <div> hello world</div>
      }
    </>
  );
}