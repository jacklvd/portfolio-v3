import Link from 'next/link';
import { WavyButtonBorder, WavyCard } from '@/components/effects/wavy-frame';

export default function ProjectNotFound() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
			<WavyCard className="max-w-md p-10">
				<p className="mb-3 font-title text-4xl text-foreground">
					Page missing its pages
				</p>
				<p className="font-hand text-lg text-muted-foreground">
					Couldn&apos;t find that project. It might&apos;ve been renamed or
					moved.
				</p>
			</WavyCard>
			<Link
				href="/meet-jack#work"
				className="group relative inline-flex items-center gap-2 px-5 py-2.5 font-hand text-lg text-foreground transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px]"
			>
				<WavyButtonBorder />
				Back to projects
			</Link>
		</div>
	);
}
