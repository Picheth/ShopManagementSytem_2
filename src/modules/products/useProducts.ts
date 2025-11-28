import { useFirestoreCollection } from "../../hooks/useFirestoreCollection";
import { Product } from "../../../types";

const useProducts = () => {
  const { items: products, loading, error } = useFirestoreCollection<Product>("products");

  return {
    products,
    loading,
    error,
  };
}

export default useProducts;