import { useState, useEffect } from "react";
import { Contact } from "../types";

export function useContacts() {
	const [contacts, setContacts] = useState<Contact[]>([]);
	useEffect(() => {
		// Fetch contacts logic here
	}, []);
	return { contacts };
}
