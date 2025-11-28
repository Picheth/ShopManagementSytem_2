import React from "react";

type DashboardLayoutProps = {
	children: React.ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			<header style={{ background: "#222", color: "#fff", padding: 16 }}>
				<h1>Shop Management System</h1>
			</header>
			<main style={{ flex: 1, padding: 24 }}>{children}</main>
			<footer style={{ background: "#eee", padding: 16, textAlign: "center" }}>
				&copy; {new Date().getFullYear()} Shop Management System
			</footer>
		</div>
	);
}
