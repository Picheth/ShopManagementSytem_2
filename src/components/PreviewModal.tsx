import React from "react";
import Modal from "react-modal";


Modal.setAppElement("#root");


export function PreviewModal({ isOpen, onClose, validRows, invalidRows, onConfirm }: any) {
return (
<Modal isOpen={isOpen} onRequestClose={onClose} contentLabel="Preview Import Data">
<h2>Preview Import</h2>
<p>{validRows.length} valid rows, {invalidRows.length} invalid rows</p>


<h3>Invalid Rows (first 5)</h3>
<div style={{ maxHeight: 200, overflow: "auto" }}>
{invalidRows.slice(0, 5).map((it: any, i: number) => (
<div key={i} style={{ border: "1px solid #eee", padding: 8, marginBottom: 6 }}>
<strong>Row #{it.index + 1}</strong>
<pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(it.errors, null, 2)}</pre>
<pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(it.row, null, 2)}</pre>
</div>
))}
</div>


<h3>Valid Rows (first 10)</h3>
<div style={{ maxHeight: 300, overflow: "auto" }}>
{validRows.slice(0, 10).map((r: any, i: number) => (
<div key={i} style={{ borderBottom: "1px solid #eee", padding: 6 }}>
{Object.entries(r).map(([k, v]) => (
<div key={k}><strong>{k}:</strong> {String(v)}</div>
))}
</div>
))}
</div>


<div style={{ marginTop: 12, display: "flex", gap: 8 }}>
<button onClick={onClose}>Cancel</button>
<button onClick={() => onConfirm()}>Confirm Import ({validRows.length})</button>
</div>
</Modal>
);
}