import { useState, useEffect } from "react";
import { Customer } from "../types";

export function useCustomers() {
	const [customers, setCustomers] = useState<Customer[]>([]);
	useEffect(() => {
		// Fetch customers logic here
	}, []);
	return { customers };
}
