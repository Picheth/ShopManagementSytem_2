// components/ProductVariations.tsx

import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "../components/firebase";

interface VariationSpec {
  storage: string[];
  color: string[];
  region: string[];
  condition: string[];
}

interface ProductModel {
  id: string;
  name: string;
  specs: VariationSpec;
}

export default function ProductVariations() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [selectedSpecs, setSelectedSpecs] = useState<Partial<VariationSpec>>({});

  useEffect(() => {
    async function fetchModels() {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "productModels"));
      const modelsData: ProductModel[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        modelsData.push({
          id: doc.id,
          name: data.name,
          specs: data.specs,
        });
      });
      setModels(modelsData);
    }
    fetchModels();
  }, []);

  const selectedModel = models.find(m => m.id === selectedModelId);

  function handleSpecChange(spec: keyof VariationSpec, value: string) {
    setSelectedSpecs(prev => ({ ...prev, [spec]: value }));
  }

  return (
    <div>
      <label>Model:</label>
      <select value={selectedModelId} onChange={e => setSelectedModelId(e.target.value)}>
        <option value="">Select Model</option>
        {models.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>

      {selectedModel && (
        <>
          <label>Storage:</label>
          <select value={selectedSpecs.storage || ""} onChange={e => handleSpecChange("storage", e.target.value)}>
            <option value="">Select Storage</option>
            {selectedModel.specs.storage.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label>Color:</label>
          <select value={selectedSpecs.color || ""} onChange={e => handleSpecChange("color", e.target.value)}>
            <option value="">Select Color</option>
            {selectedModel.specs.color.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label>Region:</label>
          <select value={selectedSpecs.region || ""} onChange={e => handleSpecChange("region", e.target.value)}>
            <option value="">Select Region</option>
            {selectedModel.specs.region.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <label>Condition:</label>
          <select value={selectedSpecs.condition || ""} onChange={e => handleSpecChange("condition", e.target.value)}>
            <option value="">Select Condition</option>
            {selectedModel.specs.condition.map(cond => <option key={cond} value={cond}>{cond}</option>)}
          </select>
        </>
      )}
    </div>
  );
}