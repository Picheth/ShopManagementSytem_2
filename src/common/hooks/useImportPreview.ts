import { useState } from "react";

export function useImportPreview<T>(rows: T[], validate: (row: T) => boolean) {
	const [validRows, setValidRows] = useState<T[]>([]);
	const [invalidRows, setInvalidRows] = useState<T[]>([]);

	// Simple validation logic
	function runValidation() {
		const valid: T[] = [];
		const invalid: T[] = [];
		rows.forEach((row) => {
			if (validate(row)) valid.push(row);
			else invalid.push(row);
		});
		setValidRows(valid);
		setInvalidRows(invalid);
	}

	return { validRows, invalidRows, runValidation };
}
