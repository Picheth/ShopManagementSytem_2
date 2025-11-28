import { useState, useEffect } from "react";
import { Product } from "../../../../types";

export function useProducts() {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	useEffect(() => {
		// TODO: Replace with Firestore fetch logic
		setLoading(true);
		setTimeout(() => {
			// Simulate fetch
			setProducts([]);
			setLoading(false);
		}, 500);
	}, []);
    const addItem = async (payload: any) => {
        // TODO: Implement your logic add item to Firestore
        console.log("Add product", payload);
    };

	return { products, loading, error, addItem };
}