import React from "react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  validRows: any[];
  invalidRows: any[];
  onConfirm: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  validRows,
  invalidRows,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 400,
        }}
      >
        <h2>Preview Import</h2>
        <div>
          <strong>Valid Rows:</strong> {validRows.length}
        </div>
        <div>
          <strong>Invalid Rows:</strong> {invalidRows.length}
        </div>
        <div style={{ marginTop: 16 }}>
          <button onClick={onConfirm}>Confirm Import</button>
          <button onClick={onClose} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;