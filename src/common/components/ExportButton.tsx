import React from "react";

type ExportButtonProps = {
	onClick: () => void;
	label?: string;
};

export function ExportButton({ onClick, label = "Export" }: ExportButtonProps) {
	return <button onClick={onClick}>{label}</button>;
}
