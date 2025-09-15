import type { Metadata } from 'next';
import './tailwind.css';
import '../styles/cyber-animations.css';
import { AuthProvider } from '../components/SessionProvider';
import { TRPCProvider } from '../components/TRPCProvider';

export const metadata: Metadata = {
	title: 'KIRDRO Admin Panel',
	description: 'Административная панель для портфолио kirdro.ru',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='ru'>
			<body className='font-sans antialiased'>
				<TRPCProvider>
					<AuthProvider>{children}</AuthProvider>
				</TRPCProvider>
			</body>
		</html>
	);
}
