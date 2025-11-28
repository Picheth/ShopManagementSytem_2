import GenericImport from "../../../common/components/GenericImport";
import { SupplierImportSchema } from "../../../suppliers/import/supplierImportSchema";
import { useSuppliers } from "../../../suppliers/hooks/useSuppliers";

export default function SupplierImport() {
  // You may need to implement addItem logic in your useSuppliers hook
  // For now, just pass a dummy function
  const { suppliers } = useSuppliers();
  const addItem = async (item: any) => {
    // TODO: Implement Firestore add logic
    console.log("Add supplier", item);
  };
  return (
    <GenericImport
      moduleName="suppliers"
      systemFields={["name","email","phone","address"]}
      schema={SupplierImportSchema}
      onImport={async rows => { for (const r of rows) await addItem(r); }}
      templateFields={["name","email","phone","address"]}
    />
  );
}
