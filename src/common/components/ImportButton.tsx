import React, { useRef } from "react";

type ImportButtonProps = {
	onFile: (file: File) => void;
	label?: string;
};

export function ImportButton({ onFile, label = "Import" }: ImportButtonProps) {
	const fileRef = useRef<HTMLInputElement>(null);
	return (
		<>
			<button onClick={() => fileRef.current?.click()}>{label}</button>
			<input
				ref={fileRef}
				type="file"
				style={{ display: "none" }}
				onChange={(e) => {
					if (e.target.files && e.target.files[0]) {
						onFile(e.target.files[0]);
					}
				}}
			/>
		</>
	);
}
