
import React, { useState, useMemo, useEffect } from 'react';
import DataTable from './DataTable';
import Modal from './Modal';
import { onSnapshotPaginated, addDoc, updateDoc, deleteDoc } from './database';
import type { Product, ColumnDefinition } from '../types';
import ProductForm from './ProductForm';
import ProductDetail from './ProductDetail';
import type { DocumentSnapshot, DocumentData } from './firebase';
import papa from 'papaparse';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { exportCSV, exportExcel} from '../src/utils/csvExcel';
import { parseCSVFile } from "../src/utils/csvParser";
import { parseExcelFile } from '../src/utils/excelParser';

type ProductsListProps = {
    products: Product[];
    onImport: (imported: Product[]) => void;
};

export function ProductsImportExport({ products, onImport }: ProductsListProps) {
  const handleExportCSV = () => {
    exportCSV("products.csv", products, [
      "sku", "name", "brand", "category", "price", "cost", "stock", "description"
    ]);
  };

  const handleExportExcel = () => {
    exportExcel("products.xlsx", products, [
      "sku", "name", "brand", "category", "price", "cost", "stock", "description"
    ]);
  };

  const handleImport = async (file: File) => {
    let imported: Product[] = [];
    if (file.name.endsWith(".csv")) {
      const rows = await parseCSVFile(file);
      // Map rows to Product objects as needed
      imported = rows.map(row => ({
        sku: row.sku,
        name: row.name,
        brand: row.brand,
        category: row.category,
        price: Number(row.price),
        cost: Number(row.cost),
        stock: Number(row.stock),
        description: row.description,
        model: row.model || '',
        productNo: row.productNo || '',
        variations: row.variations || [],
        id: row.id || '',
        shortModel: row.shortModel || '',
        // Required Product fields with sensible defaults
        productId: row.productId || '',
        attributes: row.attributes || {},
        costPrice: typeof row.costPrice !== 'undefined' ? Number(row.costPrice) : Number(row.cost) || 0,
      }));
    } else {
      imported = await parseExcelFile(file);
    }
    onImport(imported);
  };

  return (
    <div>
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportExcel}>Export Excel</button>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={e => e.target.files && handleImport(e.target.files[0])}
      />
      {/* ...existing product list rendering... */}
    </div>
  );
}

export const exportToCSV = (products: Product[]) => {
    const csvData = papa.unparse(products);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'products_export.csv');
}

export const importFromCSV = (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        papa.parse(file, {
            header: true,
            complete: (results) => {
                resolve(results.data as Product[]);
            }
        });
    });
}

export const importFromExcel = (file: File): Promise<Product[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData: Product[] = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
        };
        reader.onerror = (err) => {
            reject(err);
        };
        reader.readAsArrayBuffer(file);
    });
}

export const exportToExcel = (products: Product[]) => {
    const worksheet = XLSX.utils.json_to_sheet(products);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'products_export.xlsx');
}

const PAGE_SIZE = 25;

const ProductsList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageCursors, setPageCursors] = useState<(DocumentSnapshot | null)[]>([null]);
    const [isLastPage, setIsLastPage] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        // We fetch 'products' which in our new mock DB setup returns flattened variations
        const unsubscribe = onSnapshotPaginated("products", {
            pageSize: PAGE_SIZE,
            orderBy: 'id', // Ordering by variation ID
            direction: 'desc',
            startAfterDoc: pageCursors[page - 1] || null
        }, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Product[];
            setProducts(productList);

            const lastVisible = snapshot.docs[snapshot.docs.length - 1] as DocumentSnapshot<DocumentData> | undefined;
            if(lastVisible) {
                setPageCursors(prev => {
                    const newCursors = [...prev];
                    newCursors[page] = lastVisible;
                    return newCursors;
                });
            }
            setIsLastPage(snapshot.docs.length < PAGE_SIZE);
            setIsLoading(false);
        }, (err) => {
            console.error("Error fetching products", err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [page]);

    const refetchFirstPage = () => {
        setPage(1);
        setPageCursors([null]);
        setIsLastPage(false);
    };

    const handleViewDetails = (product: Product) => {
        setSelectedProduct(product);
        setIsDetailModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedProduct(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormModalOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedProduct) {
            try {
                await deleteDoc('products', selectedProduct.id);
                refetchFirstPage();
            } catch (err) { console.error("Error deleting product", err); }
            finally {
                setIsDeleteConfirmOpen(false);
                setSelectedProduct(null);
            }
        }
    };

    const handleSave = async (productData: any) => {
        // Determine if we are saving a Master or Variation based on data shape
        try {
            if (productData.type === 'MASTER') {
               await addDoc('productMasters', productData);
            } else if (productData.type === 'VARIATION') {
               await addDoc('productVariations', productData);
            } else {
               // Fallback for direct edits of flattened objects
               if (productData.id) {
                   await updateDoc('products', productData.id, productData);
               }
            }
            refetchFirstPage();
        } catch(err) { console.error("Error saving product", err); }
        finally {
            setIsFormModalOpen(false);
            setSelectedProduct(null);
        }
    };
    
    const columns: ColumnDefinition<Product>[] = [
        { 
            header: 'SKU / Name', 
            accessor: 'name',
            render: (name, row) => (
                <button onClick={() => handleViewDetails(row)} className="text-primary hover:underline font-medium text-left">
                    <div className="font-bold text-sm">{row.sku}</div>
                    <div className="text-xs text-text-light">{String(name)}</div>
                </button>
            )
        },
        { header: 'Short Model', accessor: 'shortModel', render: (val) => <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{(val as string) || 'N/A'}</span> },
        { header: 'Brand', accessor: 'brand' },
        { header: 'Stock', accessor: 'stock', render: (val) => <span className={Number(val) < 10 ? 'text-red-500 font-bold' : ''}>{val as number} units</span> },
        { header: 'Selling Price', accessor: 'price', render: (val) => `$${Number(val).toFixed(2)}` },
        {
            header: 'Actions',
            accessor: 'id',
            render: (_, row) => (
                <div className="flex items-center gap-4">
                    <button onClick={() => handleEdit(row)} className="text-secondary hover:text-green-700 text-sm font-medium">Edit</button>
                    <button onClick={() => handleDelete(row)} className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </div>
            )
        }
    ];

    const filteredData = useMemo(() => {
        if (!searchTerm) return products;
        return products.filter(product =>
            Object.values(product).some(value => {
                if(typeof value === 'object' && value !== null) {
                    return Object.values(value).some(subValue => String(subValue).toLowerCase().includes(searchTerm.toLowerCase()))
                }
                return String(value).toLowerCase().includes(searchTerm.toLowerCase())
            })
        );
    }, [products, searchTerm]);
    
    const handleNextPage = () => !isLastPage && setPage(p => p + 1);
    const handlePrevPage = () => page > 1 && setPage(p => p - 1);

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-xl font-semibold text-text-main">Product Catalog</h2>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="relative w-full sm:w-64">
                            <input type="text" placeholder="Search SKU, Model, Brand..." className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center shrink-0 w-full sm:w-auto justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Product
                        </button>
                    </div>
                </div>
                
                {isLoading ? (
                     <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
                ) : (
                    <>
                        <DataTable columns={columns} data={filteredData} />
                        <div className="flex justify-between items-center mt-4">
                            <button onClick={handlePrevPage} disabled={page === 1 || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                            <span className="text-sm text-gray-700">Page {page}</span>
                            <button onClick={handleNextPage} disabled={isLastPage || isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
                        </div>
                    </>
                )}
            </div>

            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedProduct ? 'Edit Product / Variation' : 'Add New Product'}>
                <ProductForm onClose={() => setIsFormModalOpen(false)} onSave={handleSave} productToEdit={selectedProduct} />
            </Modal>
            
            <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                {selectedProduct && (
                     <div className="space-y-4">
                        <p>Are you sure you want to delete product <strong>{selectedProduct.sku}</strong> ({selectedProduct.name})? This will remove it from the catalog but will not affect historical sales records.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
                            <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Product Details">
                <ProductDetail product={selectedProduct} onClose={() => setIsDetailModalOpen(false)} />
            </Modal>
        </>
    );
};

export default ProductsList;
