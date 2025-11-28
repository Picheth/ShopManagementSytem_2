// src/components/MonthlyTaxPayments.tsx
import React from "react";
import { monthlyTaxReport } from "../src/data/monthlyTaxPaymentsData";

const formatRiel = (value: number) =>
  value > 0 ? `R ${value.toLocaleString("en-US")}` : "R -";
const formatUsd = (value: number) =>
  value > 0 ? `$ ${value.toFixed(2)}` : "$ -";

export default function MonthlyTaxPayments() {
  const { companyKh, companyEn, vatTin, telephone, date, exchangeRate, taxes } =
    monthlyTaxReport;

  const totalRiel = taxes.reduce((sum, t) => sum + t.taxAmountRiel, 0);
  const totalUsd = taxes.reduce((sum, t) => sum + t.taxAmountUsd, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded-2xl">
      <h2 className="text-center text-xl font-bold mb-2">
        Monthly Tax Report
      </h2>
      <p className="text-center text-gray-600 mb-4">
        សម្រាប់ខែ កញ្ញា ឆ្នាំ ២០២៥ (For September 2025)
      </p>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <p>
          <strong>នាមករណ៍សហគ្រាស៖</strong> {companyKh}
        </p>
        <p>
          <strong>Telephone:</strong> {telephone}
        </p>
        <p>
          <strong>Company Name:</strong> {companyEn}
        </p>
        <p>
          <strong>Date:</strong> {new Date(date).toLocaleDateString()}
        </p>
        <p>
          <strong>VAT TIN:</strong> {vatTin}
        </p>
        <p>
          <strong>Exchange Rate:</strong> {exchangeRate.toLocaleString()} R/USD
        </p>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">No</th>
            <th className="border p-2 text-left">Tax</th>
            <th className="border p-2">Month</th>
            <th className="border p-2 text-right">Taxable Amount</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2 text-right">Tax Amount (Riel)</th>
            <th className="border p-2 text-right">Tax Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {taxes.map((item) => (
            <tr key={item.no}>
              <td className="border p-2 text-center">{item.no}</td>
              <td className="border p-2">{item.taxName}</td>
              <td className="border p-2 text-center">{item.month}</td>
              <td className="border p-2 text-right">
                {formatRiel(item.taxableAmountRiel)}
              </td>
              <td className="border p-2 text-center">{item.rate}</td>
              <td className="border p-2 text-right">
                {formatRiel(item.taxAmountRiel)}
              </td>
              <td className="border p-2 text-right">
                {formatUsd(item.taxAmountUsd)}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-gray-50">
            <td colSpan={5} className="border p-2 text-right">
              TOTAL TAX PAYMENT
            </td>
            <td className="border p-2 text-right">{formatRiel(totalRiel)}</td>
            <td className="border p-2 text-right">{formatUsd(totalUsd)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
