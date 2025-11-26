import React from 'react';

const AnnualTaxOnIncome: React.FC = () => {
    const companyInfo = {
        name: 'STORE KNEAR YERNG',
        vatNumber: 'E002-2300004427',
        year: 2023,
    };

    const tableData = [
        { description: 'ចំណូលពីអាជីវកម្ម (Revenue) (B0=B1+B2)', code: 'B0', amount: '108,079,973' },
        { description: 'សេវាកម្ម (Sales of goods)', code: 'B1', amount: '108,079,973', isSub: true },
        { description: 'ផ្គត់ផ្គង់សេវា (Supply of service)', code: 'B2', amount: '-', isSub: true },
        { description: 'ថ្លៃដើមទំនិញនិងសេវា (CGS&CSS) (B3=B4+B5)', code: 'B3', amount: '95,527,330' },
        { description: 'ថ្លៃដើមទំនិញដែលបានលក់', code: 'B4', amount: '95,527,330', isSub: true },
        { description: 'ថ្លៃដើមសេវាកម្មដែលផ្គត់ផ្គង់', code: 'B5', amount: '-', isSub: true },
        { description: 'ចំណេញដុល (Gross Profit) (B6=B0-B3)', code: 'B6', amount: '12,552,643', highlight: true },
        { description: 'ចំណូលផ្សេងៗ (Others)', code: 'B7', amount: '-', highlight: true },
        { description: 'ចំណាយសរុបក្នុងអាជីវកម្ម (B8=B9+B10+B11+B12+B13)', code: 'B8', amount: '55,125,230' },
        { description: 'ចំណាយបុគ្គលិក', code: 'B9', amount: '8,651,580', isSub: true },
        { description: 'ចំណាយទីផ្សារ-ជួល និងចំណាយផ្សេងៗ', code: 'B10', amount: '4,359,550', isSub: true },
        { description: 'ចំណាយរដ្ឋបាល', code: 'B11', amount: '42,114,100', isSub: true },
        { description: 'ចំណាយរំលស់', code: 'B12', amount: '-', isSub: true },
        { description: 'ចំណាយផ្សេងៗ', code: 'B13', amount: '-', isSub: true, highlight: true },
        { description: 'ចំណេញ/ខាតពីអាជីវកម្ម (B14=B6+B7-B8)', code: 'B14', amount: '(42,572,587)' },
        { description: 'ពន្ធលើប្រាក់ចំណូល (B15=B14 x អត្រាពន្ធតាមច្បាប់)', code: 'B15', amount: '-' },
        { description: 'ពន្ធអប្បបរមា (B0 x 1%)', code: 'B16', amount: '1,080,800' },
        { description: 'ពន្ធលើប្រាក់ចំណូលដែលត្រូវបង់ (B17=B15-B16)', code: 'B17', amount: '-' },
    ];

    return (
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-md max-w-5xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">របាយការណ៍លទ្ធផលអាជីវកម្ម និងការគណនាពន្ធលើប្រាក់ចំណូល</h1>
                <h2 className="text-xl font-semibold text-gray-600">Income Statement and Calculation of Tax on Income</h2>
                <h3 className="text-lg font-medium text-gray-500">For {companyInfo.year}</h3>
            </header>
            
            <section className="mb-8 text-text-main">
                <p><span className="font-semibold">Company Name:</span> {companyInfo.name}</p>
                <p><span className="font-semibold">VAT NUMBER:</span> {companyInfo.vatNumber}</p>
            </section>

            <section>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-400">
                        <thead className="bg-green-100">
                            <tr>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">បរិយាយ</th>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">លេខកូដ</th>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">ចំនួនទឹកប្រាក់</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-main">
                            {tableData.map((row) => (
                                <tr key={row.code} className={`hover:bg-gray-50 ${row.highlight ? 'bg-gray-100' : ''}`}>
                                    <td className={`border border-gray-400 px-4 py-3 ${row.isSub ? 'pl-10' : ''}`}>{row.description}</td>
                                    <td className="border border-gray-400 px-4 py-3 text-center font-medium">{row.code}</td>
                                    <td className="border border-gray-400 px-4 py-3 text-right">{row.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default AnnualTaxOnIncome;
