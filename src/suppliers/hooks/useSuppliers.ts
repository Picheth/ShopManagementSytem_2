import { useState, useEffect } from "react";
import { Supplier } from "../types";

export function useSuppliers() {
	const [suppliers, setSuppliers] = useState<Supplier[]>([]);
	useEffect(() => {
		// Fetch suppliers logic here
	}, []);
	return { suppliers };
}
