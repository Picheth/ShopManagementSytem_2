import React, { useState } from "react";
import type { TaxPayment } from "../src/data/monthlyTaxPaymentsData";

interface MonthlyTaxPaymentFormProps {
  onSubmit: (data: TaxPayment) => void;
}

export default function MonthlyTaxPaymentForm({ onSubmit }: MonthlyTaxPaymentFormProps) {
  const [formData, setFormData] = useState<TaxPayment>({
    no: 0,
    taxName: "",
    month: "",
    taxableAmountRiel: 0,
    rate: "",
    taxAmountRiel: 0,
    taxAmountUsd: 0,
  });

  const [exchangeRate, setExchangeRate] = useState<number>(4000);

  // Auto-calculate Riel and USD tax amounts when taxable amount or rate changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // If user changes taxableAmountRiel or rate, recalculate tax amounts
      const amount = Number(updated.taxableAmountRiel);
      const rateValue = parseFloat(updated.rate.replace("%", "")) / 100 || 0;

      const taxAmountRiel = Math.round(amount * rateValue);
      const taxAmountUsd = +(taxAmountRiel / exchangeRate).toFixed(2);

      return { ...updated, taxAmountRiel, taxAmountUsd };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);

    // Reset form
    setFormData({
      no: 0,
      taxName: "",
      month: "",
      taxableAmountRiel: 0,
      rate: "",
      taxAmountRiel: 0,
      taxAmountUsd: 0,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto bg-white p-6 shadow rounded-2xl space-y-4"
    >
      <h3 className="text-lg font-semibold text-center">Add Monthly Tax Payment</h3>

      {/* Tax Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Tax Name</label>
        <input
          type="text"
          name="taxName"
          value={formData.taxName}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Ex: VAT Payable"
          required
        />
      </div>

      {/* Month */}
      <div>
        <label className="block text-sm font-medium mb-1">Month</label>
        <input
          type="month"
          name="month"
          value={formData.month}
          onChange={handleChange}
          className="w-full border rounded p-2"
          required
        />
      </div>

      {/* Taxable Amount (Riel) */}
      <div>
        <label className="block text-sm font-medium mb-1">Taxable Amount (Riel)</label>
        <input
          type="number"
          name="taxableAmountRiel"
          value={formData.taxableAmountRiel}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Enter amount in Riel"
          required
        />
      </div>

      {/* Rate */}
      <div>
        <label className="block text-sm font-medium mb-1">Rate (%)</label>
        <input
          type="text"
          name="rate"
          value={formData.rate}
          onChange={handleChange}
          className="w-full border rounded p-2"
          placeholder="Ex: 10%"
          required
        />
      </div>

      {/* Exchange Rate */}
      <div>
        <label className="block text-sm font-medium mb-1">Exchange Rate (R/USD)</label>
        <input
          type="number"
          value={exchangeRate}
          onChange={(e) => setExchangeRate(Number(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Calculated Results */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tax Amount (Riel)</label>
          <input
            type="text"
            value={`R ${formData.taxAmountRiel.toLocaleString("en-US")}`}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tax Amount (USD)</label>
          <input
            type="text"
            value={`$ ${formData.taxAmountUsd.toFixed(2)}`}
            readOnly
            className="w-full border rounded p-2 bg-gray-100"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Tax Payment
      </button>
    </form>
  );
}
