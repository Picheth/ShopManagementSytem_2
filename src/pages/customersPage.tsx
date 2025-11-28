import React from "react";
import { CustomerList } from "../customers/components/CustomerList";

export default function CustomersPage() {
	return (
		<div>
			<h2>Customers</h2>
			<CustomerList />
		</div>
	);
}
