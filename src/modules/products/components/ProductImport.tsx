import React from "react";
import GenericImport from "../../../common/components/GenericImport";
import { ProductImportSchema } from "../import/productImportSchema";
import { useProducts } from "../hooks/useProducts";

export default function ProductImport() {
  const { addItem } = useProducts();

  return (
    <GenericImport
      moduleName="products"
      systemFields={["sku","name","brand","category","price","cost","stock","description"]}
      schema={ProductImportSchema}
      onImport={async (rows) => {
        for (const r of rows) await addItem(r);
      }}
      templateFields={["sku","name","brand","category","price","cost","stock","description"]}
    />
  );
}
