export type BaseRecord = {
	id?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type Supplier = BaseRecord & {
	name: string;
	email?: string;
	phone?: string;
	address?: string;
};


export type Product = BaseRecord & {
sku: string;
name: string;
brand?: string;
category?: string;
price?: number;
cost?: number;
stock?: number;
description?: string;
};


export type Customer = BaseRecord & {
name: string;
email?: string;
phone?: string;
address?: string;
};


export type Contact = BaseRecord & {
name: string;
relation?: string;
phone?: string;
email?: string;
};