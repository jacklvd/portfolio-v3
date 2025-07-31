'use client';
import { useState, useEffect } from 'react';
import { client, urlFor } from '@/client/client';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import BentoCard from '@/components/magicui/bento-card';

const Project = () => {
	const [works, setWorks] = useState<Work[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		client
			.fetch('*[_type == "work"] | order(orderRank)')
			.then(data => {
				// Mark first 4 projects as featured
				const modifiedData = data.map((work: Work, index: number) => ({
					...work,
					featured: index < 4,
				}));
				setWorks(modifiedData);
				setIsLoading(false);
			})
			.catch(error => {
				console.error('Failed to fetch projects:', error);
				setIsLoading(false);
			});
	}, []);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	// Function to truncate text to a specific length
	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	// Filter featured and non-featured projects
	const featuredWorks = works.filter(work => work.featured);
	const regularWorks = works.filter(work => !work.featured);

	return (
		<section
			className="py-16 md:py-24 retro-section text-green-400 font-mono"
			id="work"
		>
			<div className="container px-4 mx-auto">
				<h2 className="text-3xl font-bold tracking-tight mb-2 text-center text-green-400 font-mono">
					&gt; PROJECTS.DIR
					<span className="text-yellow-400 animate-pulse">_</span>
				</h2>

				{isLoading ? (
					<div className="grid place-items-center h-64">
						<div className="bg-gray-900 border border-gray-700 rounded-lg p-4 max-w-md mx-auto">
							<div className="bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
								<div className="flex space-x-1 sm:space-x-2">
									<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
									<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
									<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
								</div>
								<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
									jack@portfolio ~ % loading
								</span>
								<div className="w-8 sm:w-16"></div>
							</div>
							<div className="text-green-400 font-mono text-center px-4 pb-4">
								<div>$ loading projects...</div>
								<div className="mt-2 animate-pulse">████████████ 45%</div>
								<div className="animate-spin mt-4 text-yellow-400">⚡</div>
							</div>
						</div>
					</div>
				) : (
					<div className="max-w-6xl mx-auto">
						{/* Bento Grid for Featured Projects */}
						{featuredWorks.length > 0 && (
							<div className="mb-16">
								<div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
									<div className="bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
										<div className="flex space-x-1 sm:space-x-2">
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
										</div>
										<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
											jack@portfolio ~ % ls /PROJECTS/TOPS
										</span>
										<div className="w-8 sm:w-16"></div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)] p-4">
										{/* First project (large) */}
										<motion.div
											className="lg:col-span-2 lg:row-span-2"
											variants={itemVariants}
										>
											<BentoCard work={featuredWorks[0]} size="large" />
										</motion.div>

										{/* Second project (medium) */}
										{featuredWorks.length > 1 && (
											<motion.div
												className="lg:col-span-2"
												variants={itemVariants}
											>
												<BentoCard work={featuredWorks[1]} size="medium" />
											</motion.div>
										)}

										{/* Third project (small) */}
										{featuredWorks.length > 2 && (
											<motion.div variants={itemVariants}>
												<BentoCard work={featuredWorks[2]} size="small" />
											</motion.div>
										)}

										{/* Fourth project (small) */}
										{featuredWorks.length > 3 && (
											<motion.div variants={itemVariants}>
												<BentoCard work={featuredWorks[3]} size="small" />
											</motion.div>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Regular Grid for Other Projects */}
						{regularWorks.length > 0 && (
							<>
								<div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
									<div className="bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
										<div className="flex space-x-1 sm:space-x-2">
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
											<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
										</div>
										<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
											jack@portfolio ~ % ls /PROJECTS/ALL
										</span>
										<div className="w-8 sm:w-16"></div>
									</div>

									<motion.div
										className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4"
										variants={containerVariants}
										initial="hidden"
										animate="visible"
									>
										{regularWorks.map((work, index) => (
											<motion.div
												key={work._id}
												variants={itemVariants}
												className="h-full"
											>
												<div className="bg-gray-900 border border-gray-600 rounded-lg h-full flex flex-col hover:border-gray-400 transition-colors group overflow-hidden">
													{/* macOS terminal header for each project */}
													<div className="bg-gray-800 px-3 py-2 flex items-center justify-between border-b border-gray-600">
														<div className="flex space-x-1">
															<div className="w-2 h-2 bg-red-500 rounded-full"></div>
															<div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
															<div className="w-2 h-2 bg-green-500 rounded-full"></div>
														</div>
														<span className="font-mono text-xs text-gray-300">
															[{String(index + 1).padStart(2, '0')}]{' '}
															{work.title}
														</span>
														<div className="w-4"></div>
													</div>

													<div className="p-4 flex-grow flex flex-col">
														<div className="aspect-video overflow-hidden border border-green-400 mb-3">
															<img
																src={urlFor(work.image).width(600).url()}
																alt={work.title}
																className="w-full h-full object-cover filter contrast-125 brightness-110 group-hover:filter-none transition-all duration-500"
																loading="lazy"
															/>
														</div>

														<div className="text-green-400 font-mono text-xs mb-2">
															$ cat project_info.txt
														</div>

														<h3 className="text-yellow-400 font-mono font-bold mb-2">
															&gt; {work.title}
														</h3>

														<p className="text-green-300 font-mono text-sm mb-4 flex-grow">
															{truncateText(work.description, 120)}
														</p>

														{work.technologies && (
															<div className="mb-4">
																<div className="text-cyan-400 font-mono text-xs mb-1">
																	[TECH_STACK]:
																</div>
																<div className="flex flex-wrap gap-1">
																	{work.technologies.slice(0, 3).map(tag => (
																		<span
																			key={tag}
																			className="px-2 py-1 bg-green-900 border border-green-400 text-green-300 font-mono text-xs rounded-none"
																		>
																			{tag}
																		</span>
																	))}
																	{work.technologies.length > 3 && (
																		<span className="px-2 py-1 bg-yellow-900 border border-yellow-400 text-yellow-300 font-mono text-xs rounded-none">
																			+{work.technologies.length - 3}
																		</span>
																	)}
																</div>
															</div>
														)}

														<div className="flex gap-2 mt-auto border-t border-green-400 pt-3">
															<a
																href={work.source}
																target="_blank"
																rel="noreferrer"
																className="flex-1 bg-green-400 text-black px-3 py-1 font-mono text-xs font-bold hover:bg-yellow-400 transition-colors text-center rounded-none border-2 border-green-400 hover:border-yellow-400"
															>
																[SOURCE.GIT]
															</a>
															{work.demo && (
																<a
																	href={work.demo}
																	target="_blank"
																	rel="noreferrer"
																	className="flex-1 bg-cyan-400 text-black px-3 py-1 font-mono text-xs font-bold hover:bg-yellow-400 transition-colors text-center rounded-none border-2 border-cyan-400 hover:border-yellow-400"
																>
																	[DEMO.EXE]
																</a>
															)}
														</div>
													</div>
												</div>
											</motion.div>
										))}
									</motion.div>
								</div>
							</>
						)}
					</div>
				)}

				<div className="text-center mt-10">
					<div className="bg-gray-900 border border-gray-700 rounded-lg overflow-hidden max-w-md mx-auto">
						<div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
							<div className="flex space-x-2">
								<div className="w-3 h-3 bg-red-500 rounded-full"></div>
								<div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
							</div>
							<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
								jack@portfolio ~ % more
							</span>
							<div className="w-8 sm:w-16"></div>
						</div>
						<div className="p-4">
							<div className="text-green-400 font-mono text-sm mb-2">
								$ open github_repository
							</div>
							<a
								href="https://github.com/jacklvd"
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 bg-green-400 text-black px-4 py-2 font-mono font-bold hover:bg-yellow-400 transition-colors rounded-none border-2 border-green-400 hover:border-yellow-400"
							>
								<Github size={16} />
								[MORE_PROJECTS.EXE]
							</a>
							<div className="text-green-400 font-mono text-sm mt-2">
								$ <span className="animate-pulse">█</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Project;
