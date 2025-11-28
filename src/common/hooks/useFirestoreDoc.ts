import { useState, useEffect } from "react";

export function useFirestoreDoc<T>(collectionName: string, docId: string) {
	const [item, setItem] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<any>(null);

	useEffect(() => {
		let mounted = true;
		// Replace with actual Firestore fetch logic
		setTimeout(() => {
			if (mounted) {
				setItem(null); // Replace with fetched data
				setLoading(false);
			}
		}, 500);
		return () => {
			mounted = false;
		};
	}, [collectionName, docId]);

	return { item, loading, error };
}
