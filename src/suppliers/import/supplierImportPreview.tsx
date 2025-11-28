import React from "react";

type SupplierImportPreviewProps = {
	validRows: any[];
	invalidRows: any[];
	onConfirm: () => void;
	onClose: () => void;
};

export function SupplierImportPreview({ validRows, invalidRows, onConfirm, onClose }: SupplierImportPreviewProps) {
	return (
		<div style={{ background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}>
			<h2>Supplier Import Preview</h2>
			<div>Valid Rows: {validRows.length}</div>
			<div>Invalid Rows: {invalidRows.length}</div>
			<button onClick={onConfirm}>Confirm Import</button>
			<button onClick={onClose}>Cancel</button>
		</div>
	);
}
