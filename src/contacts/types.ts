export type BaseRecord = {
	id?: string;
	createdAt?: string;
	updatedAt?: string;
};

export type Contact = BaseRecord & {
	name: string;
	relation?: string;
	phone?: string;
	email?: string;
};
