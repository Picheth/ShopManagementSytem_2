// src/data/monthlyTaxPaymentsData.ts

export interface TaxPayment {
  no: number;
  taxName: string;
  month: string;
  taxableAmountRiel: number;
  rate: string;
  taxAmountRiel: number;
  taxAmountUsd: number;
}

export interface MonthlyTaxReport {
  companyKh: string;
  companyEn: string;
  vatTin: string;
  telephone: string;
  date: string;
  exchangeRate: number;
  month: string;
  year: number;
  taxes: TaxPayment[];
}

export const monthlyTaxReport: MonthlyTaxReport = {
  companyKh: "គ្នាយើង ហ្វូនសប",
  companyEn: "Knear Yerng Phoneshop",
  vatTin: "E005-2300002849",
  telephone: "070923681",
  date: "2025-09-30",
  exchangeRate: 4000,
  month: "September",
  year: 2025,
  taxes: [
    {
      no: 1,
      taxName: "ពន្ធកាត់ទុកលើថ្លៃឈ្នួលរូបវន្តបុគ្គល (Withholding Tax Physical)",
      month: "Sep-2025",
      taxableAmountRiel: 4010000,
      rate: "10%",
      taxAmountRiel: 401000,
      taxAmountUsd: 101,
    },
    {
      no: 2,
      taxName: "ប្រាក់រំដោះពន្ធលើប្រាក់ចំណូល (Payment of Profit Tax)",
      month: "Sep-2025",
      taxableAmountRiel: 33687273,
      rate: "1%",
      taxAmountRiel: 336873,
      taxAmountUsd: 85,
    },
    {
      no: 3,
      taxName: "ពន្ធលើប្រាក់បៀវត្ស (Tax on Salary)",
      month: "Sep-2025",
      taxableAmountRiel: 0,
      rate: "5%-15%",
      taxAmountRiel: 0,
      taxAmountUsd: 0,
    },
    {
      no: 4,
      taxName: "អាករលើតម្លៃបន្ថែម (VAT Payable)",
      month: "Sep-2025",
      taxableAmountRiel: 6737455,
      rate: "10%",
      taxAmountRiel: 673745,
      taxAmountUsd: 169,
    },
  ],
};
