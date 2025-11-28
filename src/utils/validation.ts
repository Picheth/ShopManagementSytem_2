// Simple validation utility
export function validateRow(row: any, requiredFields: string[]) {
	return requiredFields.every((field) => row[field] && row[field].toString().trim() !== "");
}
