'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Main 3D Shop page - redirects to products subsection
 */
export default function Shop3DPage() {
	const router = useRouter();

	useEffect(() => {
		router.replace('/shop3d/products');
	}, [router]);

	return null;
}
