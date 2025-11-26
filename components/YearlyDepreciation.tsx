import React from 'react';

const YearlyDepreciation: React.FC = () => {
    const companyInfo = {
        name: 'STORE KNEAR YERNG',
        vatNumber: 'E002-2300004427',
        year: 2023,
    };

    const tableData = [
        { roman: 'I', description: 'រាល់តម្លៃទំនិញដែលបានលក់ចេញសរុបទាំងពន្ធអាករ', usd: '', khr: '' },
        { roman: 'II', description: 'តម្លៃទំនិញដែលបានទិញចូលវិញ និង តម្លៃទំនិញនាំចូល', usd: '$', khr: '-' },
        { roman: 'III', description: 'តម្លៃសេវាដែលបានទទួលពីការផ្គត់ផ្គង់ខាងក្រៅ', usd: '', khr: '' },
        { roman: 'IV', description: 'សរុបចំណូលជាប់អាករ', usd: '$', khr: '0' },
        { roman: 'V', description: 'ចំណាយមិនអាចកាត់កងបាន*30%', usd: '$', khr: '0' },
        { roman: 'VI', description: 'អាករលើតម្លៃបន្ថែមដែលត្រូវបង់', usd: '$', khr: '0' },
    ];

    return (
        <div className="bg-card p-6 md:p-8 rounded-lg shadow-md max-w-5xl mx-auto">
            <header className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">តារាងកិប្ចុលប្រចាំឆ្នាំ {companyInfo.year}</h1>
            </header>
            
            <section className="mb-8 text-text-main">
                <p><span className="font-semibold">Company Name:</span> {companyInfo.name}</p>
                <p><span className="font-semibold">VAT NUMBER:</span> {companyInfo.vatNumber}</p>
            </section>

            <section>
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse border border-gray-400">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">លរ</th>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">លម្អិត</th>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">USD</th>
                                <th className="border border-gray-400 px-4 py-2 text-center font-semibold text-text-main">KHR</th>
                            </tr>
                        </thead>
                        <tbody className="text-text-main">
                            {tableData.map((row) => (
                                <tr key={row.roman} className="hover:bg-gray-50">
                                    <td className="border border-gray-400 px-4 py-3 text-center font-bold">{row.roman}</td>
                                    <td className="border border-gray-400 px-4 py-3">{row.description}</td>
                                    <td className="border border-gray-400 px-4 py-3 text-center">{row.usd}</td>
                                    <td className="border border-gray-400 px-4 py-3 text-center">{row.khr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default YearlyDepreciation;