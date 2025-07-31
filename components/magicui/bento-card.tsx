import { urlFor } from '@/client/client';

const BentoCard = ({
	work,
	size,
}: {
	work: Work;
	size: 'small' | 'medium' | 'large';
}) => {
	const truncateDescription = (text: string) => {
		const maxLength = size === 'large' ? 150 : size === 'medium' ? 100 : 70;
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	return (
		<div
			className={`group relative h-full rounded-lg overflow-hidden bg-gray-900 border border-gray-600 hover:border-gray-400 transition-all duration-300 font-mono`}
		>
			{/* macOS terminal header */}
			<div className="bg-gray-800 px-3 py-2 flex items-center justify-between group-hover:bg-gray-700 transition-colors border-b border-gray-600">
				<div className="flex space-x-1">
					<div className="w-2 h-2 bg-red-500 rounded-full"></div>
					<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
				</div>
				<span className="font-mono text-xs text-gray-300">
					{work.title.slice(0, 20)}
				</span>
				<div className="w-4"></div>
			</div>

			<div className="relative">
				<div className="aspect-video overflow-hidden border-b border-gray-600">
					<img
						src={urlFor(work.image).width(800).url()}
						alt={work.title}
						className="w-full h-full object-cover filter contrast-125 brightness-110 group-hover:filter-none transition-all duration-700"
						loading="lazy"
					/>
				</div>
			</div>

			<div className="p-4 text-green-400">
				<div className="text-green-400 font-mono text-xs mb-2">
					C:\&gt; cat project_details.txt
				</div>

				<div>
					<h3
						className={`font-bold text-yellow-400 font-mono mb-2 group-hover:text-cyan-400 transition-colors ${size === 'large' ? 'text-lg' : 'text-sm'}`}
					>
						&gt; {work.title}
					</h3>
					<p className="text-green-300 font-mono text-xs mb-4 leading-relaxed">
						{truncateDescription(work.description)}
					</p>
				</div>

				<div className="mt-auto">
					{work.technologies && (
						<div className="mb-4">
							<div className="text-cyan-400 font-mono text-xs mb-1">
								[TECH_STACK]:
							</div>
							<div className="flex flex-wrap gap-1">
								{work.technologies
									.slice(0, size === 'small' ? 2 : 3)
									.map(tag => (
										<span
											key={tag}
											className="px-2 py-1 bg-green-900 border border-green-400 text-green-300 font-mono text-xs rounded-none"
										>
											{tag}
										</span>
									))}
								{work.technologies.length > (size === 'small' ? 2 : 3) && (
									<span className="px-2 py-1 bg-yellow-900 border border-yellow-400 text-yellow-300 font-mono text-xs rounded-none">
										+{work.technologies.length - (size === 'small' ? 2 : 3)}
									</span>
								)}
							</div>
						</div>
					)}

					<div className="flex gap-2">
						<a
							href={work.source}
							target="_blank"
							rel="noreferrer"
							className="flex-1 bg-green-400 text-black px-2 py-1 font-mono text-xs font-bold hover:bg-yellow-400 transition-colors text-center rounded-none border-2 border-green-400 hover:border-yellow-400"
						>
							{size === 'small' ? '[SRC]' : '[SOURCE.GIT]'}
						</a>
						{work.demo && (
							<a
								href={work.demo}
								target="_blank"
								rel="noreferrer"
								className="flex-1 bg-cyan-400 text-black px-2 py-1 font-mono text-xs font-bold hover:bg-yellow-400 transition-colors text-center rounded-none border-2 border-cyan-400 hover:border-yellow-400"
							>
								{size === 'small' ? '[DEMO]' : '[DEMO.EXE]'}
							</a>
						)}
					</div>
				</div>

				<div className="text-green-400 font-mono text-xs mt-2">
					[STATUS]: {work.demo ? 'DEPLOYED' : 'DEVELOPMENT'} | [TYPE]:{' '}
					{size.toUpperCase()}
				</div>
			</div>
		</div>
	);
};

export default BentoCard;
