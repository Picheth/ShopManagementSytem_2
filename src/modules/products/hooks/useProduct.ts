import { useState, useEffect } from "react";
import { Product } from "../../../../types";

export function useProduct(productId: string) {
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	useEffect(() => {
		// TODO: Replace with Firestore fetch logic
		setLoading(true);
		setTimeout(() => {
			// Simulate fetch
			setProduct(null);
			setLoading(false);
		}, 500);
	}, [productId]);

	return { product, loading, error };
}
