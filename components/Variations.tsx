import React, { useState, useEffect } from 'react';
import type { VariationAttribute } from '../types';
import Modal from './Modal';
import { onSnapshot, updateDoc, setDoc, deleteDoc } from './database';

interface AttributeFormProps {
    attribute: VariationAttribute | null;
    onSave: (id: string, name: string) => void;
    onCancel: () => void;
    existingIds: string[];
}

const AttributeForm: React.FC<AttributeFormProps> = ({ attribute, onSave, onCancel, existingIds }) => {
    const [name, setName] = useState(attribute?.name || '');
    const isEditing = !!attribute;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Attribute Name is required.');
            return;
        }
        let finalId = attribute?.id;
        if (!isEditing) {
            finalId = name.trim().toLowerCase().replace(/\s+/g, '_');
            if (existingIds.includes(finalId)) {
                alert(`Attribute with ID '${finalId}' already exists. Please choose a different name.`);
                return;
            }
        }
        onSave(finalId!, name.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="attr-name" className="block text-sm font-medium text-gray-700">Attribute Name</label>
                <input
                    type="text"
                    id="attr-name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm focus:border-primary focus:ring-primary"
                    placeholder="e.g., Screen Size"
                    required
                />
            </div>
            {!isEditing &&
                <p className="text-xs text-text-light mt-1">A unique ID will be generated from the name (e.g., 'screen_size'). This cannot be changed later.</p>
            }
            <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const Variations: React.FC = () => {
    const [variations, setVariations] = useState<VariationAttribute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newValues, setNewValues] = useState<Record<string, string>>({});
    const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<VariationAttribute | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onSnapshot('variations',
            null,
            (snapshot) => {
                const variationsList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as VariationAttribute[];
                setVariations(variationsList);
                setIsLoading(false);
                setError(null);
            },
            (err) => {
                console.error(err);
                setError("Failed to load variations data.");
                setIsLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    const handleAddValue = async (variationId: string) => {
        const newValue = newValues[variationId]?.trim();
        if (!newValue) return;

        const variation = variations.find(v => v.id === variationId);
        if (!variation) return;

        if (variation.values.some(val => val.toLowerCase() === newValue.toLowerCase())) {
            setNewValues(prev => ({ ...prev, [variationId]: '' }));
            return;
        }

        const updatedValues = [...variation.values, newValue].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        try {
            await updateDoc('variations', variationId, { values: updatedValues });
            setNewValues(prev => ({ ...prev, [variationId]: '' }));
        } catch (err) {
            console.error("Failed to add value:", err);
            alert("Error: Could not save the new value.");
        }
    };
    
    const handleInputChange = (variationId: string, value: string) => {
        setNewValues(prev => ({...prev, [variationId]: value}));
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, variationId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddValue(variationId);
        }
    };

    const handleDeleteValue = async (variationId: string, valueToDelete: string) => {
        const variation = variations.find(v => v.id === variationId);
        if (!variation) return;
        
        const updatedValues = variation.values.filter(val => val !== valueToDelete);

        try {
            await updateDoc('variations', variationId, { values: updatedValues });
        } catch (err) {
            console.error("Failed to delete value:", err);
            alert("Error: Could not delete the value.");
        }
    };

    const handleDeleteAttribute = async (variationId: string) => {
        if (window.confirm('Are you sure you want to delete this entire attribute and all its values? This action cannot be undone.')) {
            try {
                await deleteDoc('variations', variationId);
            } catch (err) {
                console.error("Failed to delete attribute:", err);
                alert("Error: Could not delete the attribute.");
            }
        }
    };
    
    const handleOpenAttributeModal = (attribute: VariationAttribute | null = null) => {
        setEditingAttribute(attribute);
        setIsAttributeModalOpen(true);
    };
    
    const handleSaveAttribute = async (id: string, name: string) => {
        if (editingAttribute) { // Editing name
            try {
                await updateDoc('variations', id, { name });
            } catch (err) {
                console.error("Error updating attribute:", err);
                alert("Error: Could not update the attribute.");
            }
        } else { // Adding new attribute
            try {
                await setDoc('variations', id, { name, values: [] });
            } catch (err) {
                console.error("Error adding attribute:", err);
                alert("Error: Could not add the attribute.");
            }
        }
        setIsAttributeModalOpen(false);
        setEditingAttribute(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                 <div className="bg-card p-6 rounded-lg shadow">
                     <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-text-main">Manage Product Variations</h2>
                            <p className="text-sm text-text-light mt-1">Add or manage the available options for product attributes like color, storage, etc.</p>
                        </div>
                        <button 
                            onClick={() => handleOpenAttributeModal()}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 flex items-center shrink-0 w-full sm:w-auto justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            Add Attribute
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {variations.map(variation => (
                        <div key={variation.id} className="bg-card rounded-lg shadow p-6 flex flex-col">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-primary">{variation.name}</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenAttributeModal(variation)} className="text-gray-400 hover:text-primary" aria-label={`Edit ${variation.name}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteAttribute(variation.id)} className="text-gray-400 hover:text-red-500" aria-label={`Delete ${variation.name}`}>
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2 flex-grow">
                                {variation.values.map(value => (
                                    <div key={value} className="flex justify-between items-center bg-gray-50 p-2 rounded-md text-sm">
                                        <span>{value}</span>
                                        <button onClick={() => handleDeleteValue(variation.id, value)} className="text-gray-400 hover:text-red-500 text-xs" aria-label={`Delete value ${value}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 border-t pt-4 mt-auto">
                                <input
                                    type="text"
                                    placeholder={`Add new ${variation.name.toLowerCase()}...`}
                                    value={newValues[variation.id] || ''}
                                    onChange={(e) => handleInputChange(variation.id, e.target.value)}
                                    onKeyPress={(e) => handleKeyPress(e, variation.id)}
                                    className="block w-full py-2 px-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                                />
                                <button
                                    onClick={() => handleAddValue(variation.id)}
                                    className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors duration-300 shrink-0"
                                    aria-label={`Add ${variation.name}`}
                                >
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal isOpen={isAttributeModalOpen} onClose={() => setIsAttributeModalOpen(false)} title={editingAttribute ? 'Edit Attribute' : 'Add New Attribute'}>
                    <AttributeForm attribute={editingAttribute} onSave={handleSaveAttribute} onCancel={() => setIsAttributeModalOpen(false)} existingIds={variations.map(v => v.id)} />
            </Modal>
        </>
    );
};

export default Variations;