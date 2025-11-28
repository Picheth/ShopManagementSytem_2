// Simple CSV parser utility
export function parseCSVFile(file: File): Promise<any[]> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const text = reader.result as string;
			const lines = text.split(/\r?\n/);
			const headers = lines[0].split(',');
			const rows = lines.slice(1).map(line => {
				const values = line.split(',');
				const obj: any = {};
				headers.forEach((h, i) => { obj[h.trim()] = values[i]?.trim() ?? ""; });
				return obj;
			});
			resolve(rows);
		};
		reader.onerror = reject;
		reader.readAsText(file);
	});
}
