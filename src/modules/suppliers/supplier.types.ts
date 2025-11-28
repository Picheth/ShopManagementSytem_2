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
