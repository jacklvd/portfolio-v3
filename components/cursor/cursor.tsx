'use client';

import { useEffect, useRef, useState } from 'react';

const LERP = 0.12; // ring follow speed (0 = no follow, 1 = instant)

// ── Ink trail ────────────────────────────────────────────────────────────────
// The cursor sheds little ink sparkles (same 4-point star as CoverDoodles) and
// tiny flecks that drift up and fade, like a pen leaving sparks on paper.
// Drawn on a canvas in the body's current text color, so it matches both themes.

const SPAWN_DIST = 26; // px of travel between particles
const MAX_PARTICLES = 50;
// Same shape as CoverDoodles' <Sparkle>, half-extent 7
const SPARKLE_D = 'M0 -7 Q1 -1 7 0 Q1 1 0 7 Q-1 1 -7 0 Z';

interface TrailParticle {
	x: number;
	y: number;
	size: number;
	alpha: number;
	decay: number;
	vy: number;
	rot: number;
	vr: number;
	kind: 'sparkle' | 'fleck';
	color: string;
}

export default function Cursor() {
	const dotRef = useRef<HTMLDivElement>(null);
	const ringRef = useRef<HTMLDivElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Raw cursor position
	const mouse = useRef({ x: -200, y: -200 });
	// Smoothed ring position
	const ring = useRef({ x: -200, y: -200 });

	const hovering = useRef(false);
	const clicking = useRef(false);
	const rafId = useRef<number>(0);

	const particles = useRef<TrailParticle[]>([]);
	const lastSpawn = useRef({ x: -999, y: -999 });

	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const reduced = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		// Path2D can't be built at module scope (no DOM on the server)
		const sparklePath = new Path2D(SPARKLE_D);

		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d') ?? null;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const resize = () => {
			if (!canvas) return;
			canvas.width = window.innerWidth * dpr;
			canvas.height = window.innerHeight * dpr;
			ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		resize();
		window.addEventListener('resize', resize);

		const spawn = (x: number, y: number) => {
			const list = particles.current;
			if (list.length >= MAX_PARTICLES) list.shift();
			const fleck = Math.random() < 0.4;
			list.push({
				x: x + (Math.random() - 0.5) * 10,
				y: y + (Math.random() - 0.5) * 10,
				size: fleck ? 1 + Math.random() * 1.5 : 4 + Math.random() * 4,
				alpha: 0.9,
				decay: 0.015 + Math.random() * 0.015,
				vy: -(0.2 + Math.random() * 0.4),
				rot: Math.random() * Math.PI,
				vr: (Math.random() - 0.5) * 0.05,
				kind: fleck ? 'fleck' : 'sparkle',
				color: getComputedStyle(document.body).color,
			});
		};

		const onMove = (e: MouseEvent) => {
			mouse.current = { x: e.clientX, y: e.clientY };
			setVisible(true);

			if (!reduced) {
				const dx = e.clientX - lastSpawn.current.x;
				const dy = e.clientY - lastSpawn.current.y;
				if (dx * dx + dy * dy > SPAWN_DIST * SPAWN_DIST) {
					lastSpawn.current = { x: e.clientX, y: e.clientY };
					spawn(e.clientX, e.clientY);
				}
			}
		};

		const onDown = () => {
			clicking.current = true;
			applyStates();
		};
		const onUp = () => {
			clicking.current = false;
			applyStates();
		};
		const onLeave = () => setVisible(false);
		const onEnter = () => setVisible(true);

		const onOver = (e: MouseEvent) => {
			const t = e.target as HTMLElement;
			const interactive =
				t.tagName === 'A' ||
				t.tagName === 'BUTTON' ||
				!!t.closest('a') ||
				!!t.closest('button') ||
				t.classList.contains('cursor-pointer');
			if (interactive !== hovering.current) {
				hovering.current = interactive;
				applyStates();
			}
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mousedown', onDown);
		document.addEventListener('mouseup', onUp);
		document.addEventListener('mouseleave', onLeave);
		document.addEventListener('mouseenter', onEnter);
		document.addEventListener('mouseover', onOver);
		document.documentElement.classList.add('custom-cursor');

		// RAF loop — lerp ring toward mouse and paint the ink trail each frame
		const tick = () => {
			ring.current.x += (mouse.current.x - ring.current.x) * LERP;
			ring.current.y += (mouse.current.y - ring.current.y) * LERP;

			if (dotRef.current) {
				dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
			}
			if (ringRef.current) {
				ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
			}

			if (ctx && canvas) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				const list = particles.current;
				for (let i = list.length - 1; i >= 0; i--) {
					const p = list[i];
					p.y += p.vy;
					p.rot += p.vr;
					p.alpha -= p.decay;
					if (p.alpha <= 0) {
						list.splice(i, 1);
						continue;
					}
					ctx.globalAlpha = p.alpha;
					ctx.fillStyle = p.color;
					if (p.kind === 'fleck') {
						ctx.beginPath();
						ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
						ctx.fill();
					} else {
						ctx.save();
						ctx.translate(p.x, p.y);
						ctx.rotate(p.rot);
						const s = p.size / 7;
						ctx.scale(s, s);
						ctx.fill(sparklePath);
						ctx.restore();
					}
				}
				ctx.globalAlpha = 1;
			}

			rafId.current = requestAnimationFrame(tick);
		};
		rafId.current = requestAnimationFrame(tick);

		return () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mousedown', onDown);
			document.removeEventListener('mouseup', onUp);
			document.removeEventListener('mouseleave', onLeave);
			document.removeEventListener('mouseenter', onEnter);
			document.removeEventListener('mouseover', onOver);
			document.documentElement.classList.remove('custom-cursor');
			window.removeEventListener('resize', resize);
			cancelAnimationFrame(rafId.current);
		};
	}, []);

	// Apply scale classes directly via style to avoid re-renders
	function applyStates() {
		if (!dotRef.current || !ringRef.current) return;
		const h = hovering.current;
		const c = clicking.current;

		dotRef.current.style.width = h ? '12px' : '6px';
		dotRef.current.style.height = h ? '12px' : '6px';
		dotRef.current.style.opacity = c ? '0.4' : '1';

		ringRef.current.style.width = h ? '52px' : '34px';
		ringRef.current.style.height = h ? '52px' : '34px';
		ringRef.current.style.opacity = c ? '0.3' : h ? '0.6' : '0.45';
	}

	return (
		<>
			{/* Ink-sparkle trail */}
			<canvas
				ref={canvasRef}
				aria-hidden
				className="pointer-events-none fixed inset-0 z-[9996] h-full w-full"
			/>

			{/* Sharp dot — snaps exactly to cursor */}
			<div
				ref={dotRef}
				data-cursor
				className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
				style={{
					width: 6,
					height: 6,
					opacity: visible ? 1 : 0,
					backgroundColor: 'var(--cursor-color, currentColor)',
					transition: 'width 0.2s ease, height 0.2s ease, opacity 0.2s ease',
				}}
			/>

			{/* Lagging ring */}
			<div
				ref={ringRef}
				data-cursor
				className="fixed top-0 left-0 rounded-full pointer-events-none z-[9997]"
				style={{
					width: 34,
					height: 34,
					opacity: visible ? 0.45 : 0,
					border: '1px solid var(--cursor-color, currentColor)',
					transition: 'width 0.25s ease, height 0.25s ease, opacity 0.2s ease',
				}}
			/>
		</>
	);
}
