// components/client-app-content.tsx
'use client';
import { useEffect, useState, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { NavBar } from '@/components/layout/navbar';
import PetLoader from '@/components/pet/pet-loader';
import SitePet from '@/components/pet/site-pet';
import { StarsBackground } from '@/components/stars-background';
import { WavyFilterDefs } from '@/components/effects/wavy-frame';
import { EntranceProvider } from '@/context/entrance-context';

export default function ClientAppContent({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isMounted, setIsMounted] = useState(false);
	// Flips when the preloader's book cover starts opening; the landing hero and
	// the site pet key their entrances off this.
	const [entranceOpen, setEntranceOpen] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	return (
		<MotionConfig reducedMotion="user">
			<TooltipProvider delayDuration={0}>
				<EntranceProvider value={entranceOpen}>
					<WavyFilterDefs />
					<StarsBackground />
					<Suspense fallback={null}>{children}</Suspense>
					{isMounted && <PetLoader onOpen={() => setEntranceOpen(true)} />}
					<div className="fixed top-4 right-4 z-50">
						<ThemeToggle />
					</div>
					<NavBar />
					{entranceOpen && <SitePet />}
				</EntranceProvider>
			</TooltipProvider>
		</MotionConfig>
	);
}
