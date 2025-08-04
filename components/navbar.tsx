/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { data } from '@/constants';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dock, DockIcon } from '@/components/magicui/dock';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';

export const NavBar = () => {
	const pathname = usePathname();

	// Animation variants
	const navVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.5,
				ease: 'easeOut',
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
			},
		},
	};

	return (
		<motion.div
			className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-6 flex origin-bottom h-full max-h-14"
			initial="hidden"
			animate="visible"
			variants={navVariants}
		>
			<div className="fixed bottom-0 inset-x-0 h-16 w-full bg-background to-transparent backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black,transparent)] dark:bg-background"></div>
			<TooltipProvider delayDuration={100}>
				<Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1 bg-white dark:bg-zinc-900 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] rounded-2xl bottom-5">
					{data.navbar.map((item, i) => (
						<motion.div key={item.href} variants={itemVariants}>
							<DockIcon>
								<Tooltip>
									<TooltipTrigger asChild>
										<Link
											href={item.href}
											className={cn(
												buttonVariants({ variant: 'ghost', size: 'icon' }),
												'size-12 relative',
												pathname === item.href
													? 'text-primary'
													: 'text-foreground'
											)}
										>
											<item.icon className="size-4" />
											{pathname === item.href && (
												<motion.span
													className="absolute bottom-1.5 h-1 w-1 rounded-full bg-text-dark-custom"
													layoutId="activeNavIndicator"
												/>
											)}
										</Link>
									</TooltipTrigger>
									<TooltipContent
										side="top"
										sideOffset={5}
										className="font-medium"
									>
										{item.title}
									</TooltipContent>
								</Tooltip>
							</DockIcon>
						</motion.div>
					))}
					<Separator orientation="vertical" className="h-full" />
					{Object.entries(data.social)
						.filter(([_, social]) => social.navbar)
						.map(([name, social]) => (
							<motion.div key={name} variants={itemVariants}>
								<DockIcon>
									<Tooltip>
										<TooltipTrigger asChild>
											<Link
												href={social.url}
												className={cn(
													buttonVariants({ variant: 'ghost', size: 'icon' }),
													'size-12'
												)}
												target="_blank"
												rel="noopener noreferrer"
											>
												<social.icon className="size-4" />
											</Link>
										</TooltipTrigger>
										<TooltipContent
											side="top"
											sideOffset={5}
											className="font-medium"
										>
											{name}
										</TooltipContent>
									</Tooltip>
								</DockIcon>
							</motion.div>
						))}
				</Dock>
			</TooltipProvider>
		</motion.div>
	);
};
