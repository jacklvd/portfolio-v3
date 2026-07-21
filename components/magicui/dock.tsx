'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
	AnimatePresence,
	motion,
	MotionProps,
	MotionValue,
	useMotionValue,
	useSpring,
	useTransform,
} from 'motion/react';
import React, { PropsWithChildren, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

export interface DockProps extends VariantProps<typeof dockVariants> {
	className?: string;
	iconSize?: number;
	iconMagnification?: number;
	iconDistance?: number;
	direction?: 'top' | 'middle' | 'bottom';
	children: React.ReactNode;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 60;
const DEFAULT_DISTANCE = 140;

// Shared spring feel for every magnified value (width and glyph scale) so the
// icon and its container animate in lockstep rather than drifting apart.
const SPRING = { mass: 0.1, stiffness: 150, damping: 12 };

const dockVariants = cva(
	'supports-backdrop-blur:bg-white/10 supports-backdrop-blur:dark:bg-black/10 mx-auto mt-8 flex h-[58px] w-max items-center justify-center gap-2 rounded-2xl border p-2 backdrop-blur-md'
);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
	(
		{
			className,
			children,
			iconSize = DEFAULT_SIZE,
			iconMagnification = DEFAULT_MAGNIFICATION,
			iconDistance = DEFAULT_DISTANCE,
			direction = 'middle',
			...props
		},
		ref
	) => {
		const mouseX = useMotionValue(Infinity);
		// Touch devices emulate mousemove on tap but never fire mouseleave, so a
		// tapped icon would stay stuck magnified. Only wire magnification for real
		// hover-capable pointers; elsewhere mouseX stays Infinity → icons rest flat.
		const [canHover] = useState(
			() =>
				typeof window !== 'undefined' &&
				window.matchMedia('(hover: hover) and (pointer: fine)').matches
		);

		const renderChildren = () => {
			return React.Children.map(children, child => {
				if (
					React.isValidElement<DockIconProps>(child) &&
					child.type === DockIcon
				) {
					return React.cloneElement(child, {
						...child.props,
						mouseX: mouseX,
						size: iconSize,
						magnification: iconMagnification,
						distance: iconDistance,
						canHover: canHover,
					});
				}
				return child;
			});
		};

		return (
			<motion.div
				ref={ref}
				onMouseMove={canHover ? e => mouseX.set(e.pageX) : undefined}
				onMouseLeave={canHover ? () => mouseX.set(Infinity) : undefined}
				{...props}
				className={cn(dockVariants({ className }), {
					'items-start': direction === 'top',
					'items-center': direction === 'middle',
					'items-end': direction === 'bottom',
				})}
			>
				{renderChildren()}
			</motion.div>
		);
	}
);

Dock.displayName = 'Dock';

export interface DockIconProps
	extends Omit<
		MotionProps & React.HTMLAttributes<HTMLDivElement>,
		'children' | 'title'
	> {
	size?: number;
	magnification?: number;
	distance?: number;
	mouseX?: MotionValue<number>;
	/** Passed down by Dock: false on touch/no-hover pointers. */
	canHover?: boolean;
	className?: string;
	/** Optional label that springs up above the icon on hover (Aceternity-style). */
	title?: React.ReactNode;
	children?: React.ReactNode;
	props?: PropsWithChildren;
}

const DockIcon = ({
	size = DEFAULT_SIZE,
	magnification = DEFAULT_MAGNIFICATION,
	distance = DEFAULT_DISTANCE,
	mouseX,
	canHover = true,
	className,
	title,
	children,
	...props
}: DockIconProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const padding = Math.max(6, size * 0.2);
	const defaultMouseX = useMotionValue(Infinity);
	const [hovered, setHovered] = useState(false);

	const distanceCalc = useTransform(mouseX ?? defaultMouseX, (val: number) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return val - bounds.x - bounds.width / 2;
	});

	const sizeTransform = useTransform(
		distanceCalc,
		[-distance, 0, distance],
		[size, magnification, size]
	);

	// Grow the glyph in step with the container so a magnified icon reads as a
	// bigger icon — not a tiny icon floating in a big circle.
	const glyphTransform = useTransform(
		distanceCalc,
		[-distance, 0, distance],
		[1, magnification / size, 1]
	);

	const scaleSize = useSpring(sizeTransform, SPRING);
	const glyphScale = useSpring(glyphTransform, SPRING);

	return (
		<motion.div
			ref={ref}
			style={{ width: scaleSize, height: scaleSize, padding }}
			onMouseEnter={canHover ? () => setHovered(true) : undefined}
			onMouseLeave={canHover ? () => setHovered(false) : undefined}
			className={cn(
				'relative flex aspect-square cursor-pointer items-center justify-center rounded-full',
				className
			)}
			{...props}
		>
			<AnimatePresence>
				{title && hovered && (
					<motion.div
						initial={{ opacity: 0, y: 10, x: '-50%' }}
						animate={{ opacity: 1, y: 0, x: '-50%' }}
						exit={{ opacity: 0, y: 2, x: '-50%' }}
						className="pointer-events-none absolute -top-8 left-1/2 w-fit whitespace-pre rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-sm"
					>
						{title}
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div
				style={{ scale: glyphScale }}
				className="flex items-center justify-center"
			>
				{children}
			</motion.div>
		</motion.div>
	);
};

DockIcon.displayName = 'DockIcon';

export { Dock, DockIcon, dockVariants };
