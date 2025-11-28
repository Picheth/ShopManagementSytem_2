import React from "react";

type ImportPreviewModalProps = {
	isOpen: boolean;
	validRows: any[];
	invalidRows: any[];
	onConfirm: () => void;
	onClose: () => void;
};

export function ImportPreviewModal({ isOpen, validRows, invalidRows, onConfirm, onClose }: ImportPreviewModalProps) {
	if (!isOpen) return null;
	return (
		<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.3)" }}>
			<div style={{ background: "#fff", margin: "10% auto", padding: 24, maxWidth: 600 }}>
				<h2>Import Preview</h2>
				<div>
					<strong>Valid Rows:</strong> {validRows.length}
				</div>
				<div>
					<strong>Invalid Rows:</strong> {invalidRows.length}
				</div>
				<button onClick={onConfirm}>Confirm Import</button>
				<button onClick={onClose}>Cancel</button>
			</div>
		</div>
	);
}
