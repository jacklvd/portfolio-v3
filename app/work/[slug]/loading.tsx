// Native App Router loading UI: shown as the Suspense fallback while the async
// server page fetches project data + README. Mirrors ProjectDetailView's layout.
export default function Loading() {
	return (
		<div className="flex min-h-screen flex-col">
			<main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16 sm:px-10 md:px-16 md:py-24">
				{/* Back link */}
				<div className="mb-8 h-6 w-40 animate-pulse rounded bg-foreground/10" />

				{/* Cover image */}
				<div className="mb-8 aspect-video w-full animate-pulse rounded bg-foreground/10" />

				{/* Title */}
				<div className="mb-4 h-12 w-3/4 animate-pulse rounded bg-foreground/10 md:h-14" />

				{/* Tech tags */}
				<div className="mb-6 flex flex-wrap gap-1.5">
					{[16, 12, 20, 14].map((w, i) => (
						<div
							key={i}
							className="h-5 animate-pulse rounded bg-foreground/10"
							style={{ width: `${w * 4}px` }}
						/>
					))}
				</div>

				{/* Source / demo buttons */}
				<div className="mb-10 flex flex-wrap gap-3">
					<div className="h-11 w-28 animate-pulse rounded bg-foreground/10" />
					<div className="h-11 w-28 animate-pulse rounded bg-foreground/10" />
				</div>

				<div className="mb-10 h-px w-full bg-foreground/10" />

				{/* Body lines */}
				<div className="space-y-4">
					{['100%', '92%', '96%', '80%', '100%', '88%', '70%'].map((w, i) => (
						<div
							key={i}
							className="h-5 animate-pulse rounded bg-foreground/10"
							style={{ width: w }}
						/>
					))}
				</div>
			</main>
		</div>
	);
}
