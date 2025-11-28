// Utility for CSV/Excel export
export function exportCSV(filename: string, rows: any[], headers: string[]) {
	const csv = [headers.join(","), ...rows.map(r => headers.map(h => r[h]).join(","))].join("\n");
	const blob = new Blob([csv], { type: "text/csv" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
}

export function exportExcel(filename: string, rows: any[], headers: string[]) {
	alert("Excel export not implemented. Use a library like xlsx.");
}
