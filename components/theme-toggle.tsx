'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Handle hydration
	useEffect(() => {
		setMounted(true);
	}, []);

	// Determine if dark mode is active
	const isDarkMode = theme === 'dark';

	const handleThemeToggle = () => {
		setTheme(isDarkMode ? 'light' : 'dark');
	};

	// Don't render until mounted to avoid hydration mismatch
	if (!mounted) {
		return null;
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={handleThemeToggle}
			className="rounded-full"
		>
			<SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
