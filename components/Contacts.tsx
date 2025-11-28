import React, { useState, useMemo } from 'react';
import DataTable from './DataTable';
import Card from './Card';
import Modal from './Modal';
import ContactForm from './ContactForm';
import { MOCK_CONTACTS_DATA } from '../src/data/mockData';
import type { Contact, ColumnDefinition } from '../types';

const Contacts: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [sortKey, setSortKey] = useState<keyof Contact | null>('lastContactDate');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: keyof Contact) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };
    
    const handleAddNew = () => {
        setSelectedContact(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = (contact: Contact) => {
        setSelectedContact(contact);
        setIsFormModalOpen(true);
    };

    const handleDelete = (contact: Contact) => {
        setSelectedContact(contact);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (selectedContact) {
            setContacts(prev => prev.filter(c => c.id !== selectedContact.id));
            setIsDeleteConfirmOpen(false);
            setSelectedContact(null);
        }
    };

    const handleSaveContact = (contactData: Omit<Contact, 'id' | 'lastContactDate'> | Contact) => {
        if ('id' in contactData) { // Editing
            setContacts(prev => prev.map(c => c.id === contactData.id ? {...c, ...contactData} : c));
        } else { // Adding
            const newContact: Contact = {
                ...contactData,
                id: `C${(contacts.length + 1).toString().padStart(3, '0')}`,
                lastContactDate: new Date().toISOString().split('T')[0]
            };
            setContacts(prev => [newContact, ...prev]);
        }
        setIsFormModalOpen(false);
    };
    
    const columns: ColumnDefinition<Contact>[] = [
        { header: 'Name', accessor: 'name', sortable: true },
        { header: 'Company', accessor: 'company', render: (val) => val || 'N/A' },
        { 
          header: 'Type', 
          accessor: 'type',
          sortable: true,
          render: (type) => (
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              type === 'Customer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            }`}>
              {String(type)}
            </span>
          )
        },
        { header: 'Email', accessor: 'email' },
        { header: 'Phone', accessor: 'phone' },
        { header: 'Last Contact', accessor: 'lastContactDate', sortable: true },
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

    const { filteredData, totalContacts, totalLeads } = useMemo(() => {
        const data = contacts.filter(contact =>
            contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        return {
            filteredData: data,
            totalContacts: contacts.length,
            totalLeads: contacts.filter(c => c.type === 'Lead').length,
        }
    }, [contacts, searchTerm]);

    const sortedData = useMemo(() => {
        const dataToSort = [...filteredData];
        if (sortKey) {
            dataToSort.sort((a, b) => {
                const valA = a[sortKey];
                const valB = b[sortKey];

                if (valA == null || valB == null) return 0;

                let comparison = 0;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else {
                    comparison = String(valA).localeCompare(String(valB));
                }

                return sortDirection === 'desc' ? -comparison : comparison;
            });
        }
        return dataToSort;
    }, [filteredData, sortKey, sortDirection]);
    
    const handleExport = () => {
        const headers = ['id', 'name', 'type', 'email', 'phone', 'company', 'lastContactDate'].join(',');
        const rows = sortedData.map(c => [c.id, `"${c.name}"`, c.type, c.email, c.phone, `"${c.company || ''}"`, c.lastContactDate].join(','));
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts.csv';
        link.click();
    };
    
    const handleImport = () => alert("This would open a file dialog to import contact data.");

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card title="Total Contacts" value={String(totalContacts)} change="All customers & leads" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.61.91 1.074 1.97 1.074 3.125" /></svg>} />
                    <Card title="New Leads" value={String(totalLeads)} change="Potential customers" changeType="increase" icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 100 15 7.5 7.5 0 000-15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2" /></svg>} />
                </div>
                <div className="bg-card p-6 rounded-lg shadow space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h2 className="text-xl font-semibold text-text-main">Contact Management</h2>
                         <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
                            <input type="text" placeholder="Search contacts..." className="block w-full sm:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md sm:text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            <button onClick={handleImport} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>Import</button>
                            <button onClick={handleExport} className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>Export</button>
                            <button onClick={handleAddNew} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>Add</button>
                        </div>
                    </div>
                    <DataTable columns={columns} data={sortedData} sortKey={sortKey} sortDirection={sortDirection} onSort={handleSort} />
                </div>
            </div>
            <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={selectedContact ? "Edit Contact" : "Add New Contact"}>
                <ContactForm onClose={() => setIsFormModalOpen(false)} onSave={handleSaveContact} contactToEdit={selectedContact} />
            </Modal>
             <Modal isOpen={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)} title="Confirm Deletion">
                {selectedContact && (
                     <div className="space-y-4">
                        <p>Are you sure you want to delete contact <strong>{selectedContact.name}</strong>? This action cannot be undone.</p>
                        <div className="bg-gray-50 px-4 py-3 -mx-6 -mb-4 sm:flex sm:flex-row-reverse rounded-b-lg">
                            <button type="button" onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Delete</button>
                            <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default Contacts;