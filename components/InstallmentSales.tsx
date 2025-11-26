import React, { useState, useMemo, useEffect } from 'react';
import { onSnapshot } from "./database";
import type { Sale, InstallmentPlan, Installment, PaymentMethod } from '../types';
import InstallmentPaymentModal from './InstallmentPaymentModal';

type GroupedInstallment = {
    sale: Sale;
    plan: InstallmentPlan;
    installments: Installment[];
};

const InstallmentSales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [plans, setPlans] = useState<InstallmentPlan[]>([]);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

    useEffect(() => {
        const unsubSales = onSnapshot('sales', null, (snapshot) => {
            setSales(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sale[]);
        }, console.error);

        const unsubPlans = onSnapshot('installmentPlans', null, (snapshot) => {
            setPlans(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InstallmentPlan[]);
        }, console.error);

        const unsubInstallments = onSnapshot('installments', null, (snapshot) => {
            setInstallments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Installment[]);
            setIsLoading(false);
        }, console.error);

        return () => {
            unsubSales();
            unsubPlans();
            unsubInstallments();
        };
    }, []);

    const groupedData = useMemo(() => {
        const installmentSales = sales.filter(s => s.installmentPlanId);
        const plansMap = new Map(plans.map(p => [p.id, p]));
        const installmentsByPlan = installments.reduce((acc, inst) => {
            if (!acc[inst.planId]) {
                acc[inst.planId] = [];
            }
            acc[inst.planId].push(inst);
            return acc;
        }, {} as Record<string, Installment[]>);

        return installmentSales.map(sale => ({
            sale,
            plan: plansMap.get(sale.installmentPlanId!)!,
            installments: (installmentsByPlan[sale.installmentPlanId!] || []).sort((a,b) => a.installmentNumber - b.installmentNumber)
        })).filter(group => group.plan && group.plan.status === 'Active');
    }, [sales, plans, installments]);

    const toggleGroup = (saleId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(saleId)) {
                newSet.delete(saleId);
            } else {
                newSet.add(saleId);
            }
            return newSet;
        });
    };

    const handleRecordPayment = (installment: Installment) => {
        setSelectedInstallment(installment);
        setIsPaymentModalOpen(true);
    };

    const handleSavePayment = (installmentId: string, paymentDate: string, paymentMethod: PaymentMethod) => {
        // This should be an updateDoc call in a real app
        console.log("Saving payment for", installmentId, paymentDate, paymentMethod);
        
        // Mock update
        const installment = installments.find(i => i.id === installmentId);
        const plan = plans.find(p => p.id === installment?.planId);

        setInstallments(prev => prev.map(inst => 
            inst.id === installmentId 
            ? { ...inst, status: 'Paid', amountPaid: inst.amountDue, paymentDate }
            : inst
        ));

        if (installment && plan) {
            setSales(prev => prev.map(sale => 
                sale.id === plan.saleId
                ? { ...sale, amountPaid: sale.amountPaid + installment.amountDue }
                : sale
            ));
        }

        setIsPaymentModalOpen(false);
        setSelectedInstallment(null);
    };

    const getStatusClasses = (status: Installment['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Overdue': return 'bg-red-100 text-red-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
        }
    };
    
    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
    }

    return (
        <>
            <div className="bg-card p-6 rounded-lg shadow space-y-4">
                <h2 className="text-xl font-semibold text-text-main">Installment Sales Management</h2>
                <p className="text-sm text-text-light">Showing active installment plans. Completed plans are hidden.</p>
                <div className="space-y-2">
                    {groupedData.length > 0 ? groupedData.map(({ sale, plan, installments }) => {
                        const isExpanded = expandedGroups.has(sale.id);
                        const paidAmount = plan.downPayment + installments.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amountDue, 0);
                        const progress = (paidAmount / plan.totalAmount) * 100;

                        return (
                            <div key={sale.id} className="border rounded-lg">
                                <div className="p-4 cursor-pointer hover:bg-gray-50 flex items-center gap-4" onClick={() => toggleGroup(sale.id)}>
                                    <div className="flex-1">
                                        <p className="font-bold text-primary">{sale.customer}</p>
                                        <p className="text-sm text-text-light">Sale ID: {sale.saleInvoiceId} | Plan: {plan.id}</p>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{`$${paidAmount.toFixed(2)} / $${plan.totalAmount.toFixed(2)}`}</span>
                                                <span>{progress.toFixed(0)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                                {isExpanded && (
                                    <div className="border-t p-4">
                                        <table className="min-w-full text-sm">
                                            <thead className="text-left text-text-light"><tr><th className="py-2 px-2">#</th><th className="py-2 px-2">Due Date</th><th className="py-2 px-2">Amount</th><th className="py-2 px-2">Status</th><th className="py-2 px-2">Action</th></tr></thead>
                                            <tbody>
                                                {installments.map(inst => (
                                                    <tr key={inst.id} className="border-b last:border-b-0">
                                                        <td className="py-2 px-2">{inst.installmentNumber}</td>
                                                        <td className="py-2 px-2">{inst.dueDate}</td>
                                                        <td className="py-2 px-2">${inst.amountDue.toFixed(2)}</td>
                                                        <td className="py-2 px-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClasses(inst.status)}`}>{inst.status}</span></td>
                                                        <td className="py-2 px-2">
                                                            {inst.status !== 'Paid' && (
                                                                <button onClick={() => handleRecordPayment(inst)} className="text-primary hover:text-primary-dark font-medium">Record Payment</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    }) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                             <h3 className="text-lg font-medium text-text-main">No active installment plans.</h3>
                            <p className="mt-1 text-sm text-text-light">
                                Create a sale with an installment plan from the Point of Sale screen.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <InstallmentPaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} installment={selectedInstallment} onSave={handleSavePayment} />
        </>
    );
};

export default InstallmentSales;
