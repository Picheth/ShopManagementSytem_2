// Simple CSV export utility
export function exportToCSV(filename: string, rows: any[], headers: string[]) {
	const csvContent = [headers.join(","), ...rows.map((row) => headers.map((h) => row[h]).join(","))].join("\n");
	const blob = new Blob([csvContent], { type: "text/csv" });
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	link.click();
}
