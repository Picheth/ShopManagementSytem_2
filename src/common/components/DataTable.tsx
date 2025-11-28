import React from "react";

type DataTableProps<T> = {
	columns: { key: keyof T; label: string }[];
	data: T[];
};

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
	return (
		<table style={{ width: "100%", borderCollapse: "collapse" }}>
			<thead>
				<tr>
					{columns.map((col) => (
						<th key={String(col.key)}>{col.label}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, i) => (
					<tr key={i}>
						{columns.map((col) => (
							<td key={String(col.key)}>{String(row[col.key])}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}
