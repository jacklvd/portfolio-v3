// app/meet-jack/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { About } from './components/about';
import ExperienceSection from './components/experience';
import Footer from '../../components/footer';
import Project from './components/projects';
import { PublicationsSection } from './components/publications';
import { ChevronUp } from 'lucide-react';
import { useLoading } from '@/context/loading-context';
import SkeletonLoading from '@/components/skeletonloading';
import { ErrorBoundary } from '@/components/error-boundary';

export default function Portfolio() {
	const [showScrollTop, setShowScrollTop] = useState(false);
	const { isLoading } = useLoading();
	const [isMounted, setIsMounted] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Set isMounted to true on mount and check screen width
	useEffect(() => {
		setIsMounted(true);

		// Check if screen width is 375px or less
		const checkMobile = () => {
			setIsMobile(window.innerWidth <= 375);
		};

		// Initial check
		checkMobile();

		// Add resize listener to update when window is resized
		window.addEventListener('resize', checkMobile);

		// Cleanup
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Check scroll position to show/hide scroll-to-top button
	useEffect(() => {
		if (!isMounted) return;

		try {
			const handleScroll = () => {
				if (window.scrollY > 500 && !isMobile) {
					setShowScrollTop(true);
				} else {
					setShowScrollTop(false);
				}
			};

			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		} catch (error) {
			console.error('Scroll event error:', error);
		}
	}, [isMounted, isMobile]);

	const scrollToTop = () => {
		try {
			window.scrollTo({
				top: 0,
				behavior: 'smooth',
			});
		} catch (error) {
			console.error('Scroll to top error:', error);
		}
	};

	// Prevent initial hydration mismatch
	if (!isMounted) {
		return null;
	}

	// Show loading skeleton if still loading
	if (isLoading) {
		return <SkeletonLoading />;
	}

	return (
		<ErrorBoundary>
			<div className="min-h-screen flex flex-col retro-section">
				{/* Main content */}
				<main className="flex-1">
					<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
						<About />
						<ExperienceSection />
						<Project />
						<PublicationsSection />
						{/* <ContactSection /> */}
					</div>
				</main>

				<Footer />

				{/* Retro scroll to top button - hidden on mobile */}
				{showScrollTop && (
					<div
						onClick={scrollToTop}
						className="fixed bottom-6 right-6 z-50 hidden sm:block cursor-pointer group"
						aria-label="Scroll to top"
					>
						<div className="bg-green-400 text-black border-2 border-green-400 rounded-none p-2 hover:bg-yellow-400 hover:border-yellow-400 transition-colors font-mono font-bold">
							<div className="flex items-center gap-2">
								<ChevronUp size={12} />
							</div>
						</div>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
}
