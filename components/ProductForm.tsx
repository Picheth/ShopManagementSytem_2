
import React, { useState, useEffect } from 'react';
import type { ProductMaster, ProductVariation, VariationAttribute } from '../types';
import { getDocs } from './database';

interface ProductFormProps {
    onClose: () => void;
    onSave: (product: any) => void;
    productToEdit?: any | null; // Can be ProductMaster or ProductVariation
}

const ProductForm: React.FC<ProductFormProps> = ({ onClose, onSave, productToEdit }) => {
    // Mode: 'MASTER' (create parent) or 'VARIATION' (add sku to parent)
    const [mode, setMode] = useState<'MASTER' | 'VARIATION'>('MASTER');
    
    const [masterData, setMasterData] = useState<Partial<ProductMaster>>({
        name: '', brand: '', model: '', category: 'Phone', description: ''
    });
    
    const [variationData, setVariationData] = useState<Partial<ProductVariation>>({
        sku: '', price: 0, costPrice: 0, stock: 0, attributes: {}, shortModel: '', subCategory: ''
    });

    const [selectedMasterId, setSelectedMasterId] = useState<string>('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Dynamic Data
    const [availableMasters, setAvailableMasters] = useState<ProductMaster[]>([]);
    const [availableAttributes, setAvailableAttributes] = useState<VariationAttribute[]>([]);

    // Fetch Data on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const mastersSnap = await getDocs('productMasters');
                const masters = mastersSnap.docs.map(d => ({id: d.id, ...d.data()})) as ProductMaster[];
                setAvailableMasters(masters);

                const varsSnap = await getDocs('variations');
                const vars = varsSnap.docs.map(d => ({id: d.id, ...d.data()})) as VariationAttribute[];
                setAvailableAttributes(vars);
            } catch (e) {
                console.error("Failed to load form data", e);
            }
        };
        fetchData();
    }, []);

    // Load data if editing
    useEffect(() => {
        if (productToEdit) {
            if (productToEdit.productId) {
                // It's a variation
                setMode('VARIATION');
                setSelectedMasterId(productToEdit.productId);
                setVariationData(productToEdit);
                // Pre-fill master data for context (read-only usually)
                const master = availableMasters.find(m => m.id === productToEdit.productId);
                if(master) setMasterData(master);
            } else {
                // It's a master
                setMode('MASTER');
                setMasterData(productToEdit);
            }
        }
    }, [productToEdit, availableMasters]);

    const validateMaster = () => {
        const newErrors: Record<string, string> = {};
        if (!masterData.name?.trim()) newErrors.name = "Product Name is required";
        if (!masterData.brand?.trim()) newErrors.brand = "Brand is required";
        if (!masterData.category) newErrors.category = "Category is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateVariation = () => {
        const newErrors: Record<string, string> = {};
        if (!selectedMasterId) newErrors.master = "Parent Product must be selected";
        if (!variationData.sku?.trim()) newErrors.sku = "SKU is required";
        if ((variationData.price || 0) < 0) newErrors.price = "Price cannot be negative";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'MASTER') {
            if (validateMaster()) {
                onSave({ type: 'MASTER', ...masterData });
            }
        } else {
            if (validateVariation()) {
                onSave({ type: 'VARIATION', productId: selectedMasterId, ...variationData });
            }
        }
    };

    const handleAttributeChange = (key: string, value: string) => {
        setVariationData(prev => ({
            ...prev,
            attributes: { ...prev.attributes, [key]: value }
        }));
    };

    const getInputClasses = (fieldName: string) => `mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-primary focus:ring-primary ${errors[fieldName] ? 'border-red-500' : ''}`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            {/* Toggle Mode (Only if creating new) */}
            {!productToEdit && (
                <div className="flex justify-center space-x-4 border-b pb-4">
                    <button 
                        type="button"
                        onClick={() => setMode('MASTER')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'MASTER' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Create Parent Product
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMode('VARIATION')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'VARIATION' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        Add Variation (SKU)
                    </button>
                </div>
            )}

            {/* Master Product Fields */}
            {(mode === 'MASTER' || mode === 'VARIATION') && (
                <div className={`space-y-4 ${mode === 'VARIATION' ? 'opacity-75 p-4 bg-gray-50 rounded-lg border' : ''}`}>
                    <h3 className="text-lg font-medium text-gray-900">{mode === 'VARIATION' ? 'Parent Product Context' : 'Parent Product Details'}</h3>
                    
                    {mode === 'VARIATION' && !productToEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Existing Parent</label>
                            <select 
                                value={selectedMasterId} 
                                onChange={e => {
                                    setSelectedMasterId(e.target.value);
                                    const m = availableMasters.find(pm => pm.id === e.target.value);
                                    if(m) setMasterData(m);
                                }}
                                className={getInputClasses('master')}
                            >
                                <option value="">-- Select Product --</option>
                                {availableMasters.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            {errors.master && <p className="text-xs text-red-500 mt-1">{errors.master}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Product Name</label>
                            <input type="text" value={masterData.name} onChange={e => setMasterData({...masterData, name: e.target.value})} className={getInputClasses('name')} disabled={mode === 'VARIATION'} placeholder="e.g. iPhone 15 Pro" />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" value={masterData.brand} onChange={e => setMasterData({...masterData, brand: e.target.value})} className={getInputClasses('brand')} disabled={mode === 'VARIATION'} placeholder="Apple" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Model</label>
                            <input type="text" value={masterData.model} onChange={e => setMasterData({...masterData, model: e.target.value})} className={getInputClasses('model')} disabled={mode === 'VARIATION'} placeholder="iPhone 15 Pro" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select value={masterData.category} onChange={e => setMasterData({...masterData, category: e.target.value as any})} className={getInputClasses('category')} disabled={mode === 'VARIATION'}>
                                <option value="Phone">Phone</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Accessory">Accessory</option>
                                <option value="Repair Part">Repair Part</option>
                                <option value="Tablet">Tablet</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Variation Fields */}
            {mode === 'VARIATION' && (
                <div className="space-y-4 border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-900">Variation Details (SKU)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">SKU (Stock Keeping Unit)</label>
                            <input type="text" value={variationData.sku} onChange={e => setVariationData({...variationData, sku: e.target.value})} className={getInputClasses('sku')} placeholder="IP15P-256-BLK" />
                            {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                            <input type="number" value={variationData.price} onChange={e => setVariationData({...variationData, price: parseFloat(e.target.value)})} className={getInputClasses('price')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Cost Price</label>
                            <input type="number" value={variationData.costPrice} onChange={e => setVariationData({...variationData, costPrice: parseFloat(e.target.value)})} className={getInputClasses('costPrice')} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Short Model</label>
                            <input type="text" value={variationData.shortModel} onChange={e => setVariationData({...variationData, shortModel: e.target.value})} className={getInputClasses('shortModel')} placeholder="e.g. IP15P" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sub-Category</label>
                            <input type="text" value={variationData.subCategory} onChange={e => setVariationData({...variationData, subCategory: e.target.value})} className={getInputClasses('subCategory')} placeholder="Goods for Sale" />
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Attributes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {availableAttributes.map(attr => (
                                <div key={attr.id}>
                                    <label className="block text-xs font-medium text-gray-500 uppercase">{attr.name}</label>
                                    <select 
                                        value={variationData.attributes?.[attr.id] || ''} 
                                        onChange={e => handleAttributeChange(attr.id, e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:border-primary focus:ring-primary"
                                    >
                                        <option value="">Select...</option>
                                        {attr.values.map(val => <option key={val} value={val}>{val}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark sm:ml-3 sm:w-auto sm:text-sm">
                    {productToEdit ? 'Save Changes' : (mode === 'MASTER' ? 'Create Parent' : 'Add Variation')}
                </button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
