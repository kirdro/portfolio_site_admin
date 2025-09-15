import AdminLayout from '../../components/AdminLayout';
import { LoadingProvider } from '../../contexts/LoadingContext';

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LoadingProvider>
			<AdminLayout>{children}</AdminLayout>
		</LoadingProvider>
	);
}
