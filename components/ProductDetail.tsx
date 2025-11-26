
import React from 'react';
import type { Product } from '../types';

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-text-light">{label}</dt>
    <dd className="mt-1 text-sm text-text-main sm:mt-0 sm:col-span-2">{value}</dd>
  </div>
);

const ProductDetail: React.FC<ProductDetailProps> = ({ product, onClose }) => {
  if (!product) return null;

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mr-4">
      <div>
        <h3 className="text-lg font-bold text-primary">{product.name}</h3>
        <p className="text-sm text-text-light">SKU: {product.sku} | ID: {product.id}</p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <DetailRow label="Brand" value={product.brand} />
          <DetailRow label="Model" value={product.model} />
          <DetailRow label="Short Model" value={product.shortModel || 'N/A'} />
          <DetailRow label="Category" value={product.category} />
          <DetailRow label="Sub-Category" value={product.subCategory || 'N/A'} />
          <DetailRow label="Stock" value={`${product.stock} units`} />
          <DetailRow label="Cost Price" value={`$${product.costPrice.toFixed(2)}`} />
          <DetailRow label="Selling Price" value={`$${product.price.toFixed(2)}`} />
        </dl>
      </div>
       <div className="border-t border-gray-200">
        <h4 className="text-md font-semibold text-text-main pt-3">Attributes</h4>
         <dl>
          {Object.entries(product.attributes || {}).map(([key, value]) => {
            if (!value) return null;
            // Capitalize first letter of key
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return <DetailRow key={key} label={label} value={value as string} />
          })}
        </dl>
      </div>

       <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg mt-4 sticky bottom-0">
          <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Close
          </button>
      </div>
    </div>
  );
};

export default ProductDetail;
