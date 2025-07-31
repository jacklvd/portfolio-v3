'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Book, ExternalLink, FileText } from 'lucide-react';
import Link from 'next/link';

interface Publication {
	title: string;
	authors: string;
	year: string;
	url: string;
	abstract?: string;
}

export const PublicationsSection = () => {
	const publications: Publication[] = [
		{
			title: 'Real-time Speech Summarization for Medical Conversations',
			authors: 'Co-author by Jack Vo',
			year: '2024',
			url: 'https://arxiv.org/abs/2406.15888',
			abstract:
				'In doctor-patient conversations, identifying medically relevant information is crucial, posing the need for conversation summarization. In this work, we propose the first deployable real-time speech summarization system for real-world applications in industry, which generates a local summary after every N speech utterances within a conversation and a global summary after the end of a conversation.',
		},
		{
			title: 'Medical Spoken Named Entity Recognition',
			authors: 'Co-author by Jack Vo',
			year: '2024',
			url: 'https://arxiv.org/abs/2406.13337',
			abstract:
				'Spoken Named Entity Recognition (NER) aims to extracting named entities from speech and categorizing them into types like person, location, organization, etc. In this work, we present VietMed-NER - the first spoken NER dataset in the medical domain.',
		},
		{
			title: 'Sentiment Reasoning for Healthcare',
			authors: 'Co-author by Jack Vo',
			year: '2024',
			url: 'https://arxiv.org/abs/2407.21054',
			abstract:
				'Transparency in AI healthcare decision-making is crucial for building trust among AI and users. Incorporating reasoning capabilities enables Large Language Models (LLMs) to understand emotions in context, handle nuanced language, and infer unstated sentiments.',
		},
	];

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
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

	return (
		<section
			className="py-16 md:py-24 retro-section text-green-400 font-mono"
			id="publications"
		>
			<div className="container px-4 mx-auto">
				<h2 className="text-3xl font-bold tracking-tight mb-2 text-center text-green-400 font-mono">
					&gt; PUBLICATIONS.DB
					<span className="text-yellow-400 animate-pulse">_</span>
				</h2>

				<div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
					{/* macOS terminal header */}
					<div className="bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
						<div className="flex space-x-1 sm:space-x-2">
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
						</div>
						<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
							jack@portfolio ~ % ls /RESEARCH/PAPERS
						</span>
						<div className="w-8 sm:w-16"></div>
					</div>

					<div className="p-6">
						<div className="text-green-400 font-mono text-sm mb-4">
							C:\&gt; ls -la *.pdf --timeline
						</div>
						<motion.div
							className="relative max-w-3xl mx-auto"
							variants={containerVariants}
							initial="hidden"
							animate="visible"
						>
							{/* Retro timeline vertical line - neon green glow */}
							<div className="absolute left-6 sm:left-12 md:left-16 top-0 h-full w-0.5 bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>

							{publications.map((pub, index) => (
								<motion.div
									key={index}
									variants={itemVariants}
									className="relative mb-16 pl-14 sm:pl-20 md:pl-28"
								>
									{/* Retro terminal icon on the timeline */}
									<div className="absolute left-6 sm:left-12 md:left-16 top-6 transform -translate-x-1/2 z-10">
										<div className="rounded-none w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-400 text-black border-2 border-yellow-400 font-mono font-bold shadow-[0_0_15px_rgba(34,197,94,0.8)]">
											{String(index + 1).padStart(2, '0')}
										</div>
									</div>

									{/* Retro publication card */}
									<div className="bg-black border-2 border-green-400 rounded-none hover:border-yellow-400 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(250,204,21,0.5)]">
										{/* Terminal header for each publication */}
										<div className="bg-green-400 text-black px-3 py-2 flex items-center justify-between">
											<span className="font-mono text-sm font-bold">
												[PAPER_{String(index + 1).padStart(2, '0')}]{' '}
												{pub.title.slice(0, 35)}...
											</span>
											<div className="flex items-center space-x-2">
												<span className="bg-yellow-400 text-black px-2 py-1 font-mono text-xs font-bold rounded-none">
													{pub.year}
												</span>
												<div className="flex space-x-1">
													<div className="w-2 h-2 bg-red-500 rounded-none"></div>
													<div className="w-2 h-2 bg-yellow-400 rounded-none"></div>
													<div className="w-2 h-2 bg-green-600 rounded-none"></div>
												</div>
											</div>
										</div>

										<div className="p-4 sm:p-6">
											<div className="mb-3">
												<div className="text-cyan-400 font-mono text-xs mb-1">
													[TITLE]:
												</div>
												<h3 className="text-yellow-400 font-mono font-bold text-lg sm:text-xl mb-2">
													&gt; {pub.title}
												</h3>

												<div className="text-cyan-400 font-mono text-xs mb-1">
													[AUTHORS]:
												</div>
												<p className="text-green-300 font-mono text-sm mb-3">
													{pub.authors}
												</p>
											</div>

											<div className="mb-4">
												<div className="text-cyan-400 font-mono text-xs mb-1">
													[ABSTRACT]:
												</div>
												<div className="bg-gray-800 border border-green-400 p-3">
													<p className="text-green-300 font-mono text-sm leading-relaxed">
														{pub.abstract}
													</p>
												</div>
											</div>

											<div className="flex gap-3">
												<Link
													href={pub.url}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-2 bg-green-400 text-black px-3 py-2 font-mono text-xs font-bold hover:bg-yellow-400 transition-colors rounded-none border-2 border-green-400 hover:border-yellow-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] hover:shadow-[0_0_10px_rgba(250,204,21,0.5)]"
												>
													<FileText className="h-3 w-3" />
													[VIEW_PAPER.PDF]
													<ExternalLink className="h-3 w-3" />
												</Link>
											</div>

											<div className="text-green-400 font-mono text-xs mt-2">
												[STATUS]: PUBLISHED | [ACCESS]: PUBLIC | [FORMAT]: PDF |
												[TIMELINE_POS]: {index + 1}
											</div>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>{' '}
						<div className="mt-8 pt-4 border-t border-green-400">
							<div className="text-green-400 font-mono text-sm mb-2">
								C:\&gt; open scholar_profile.url
							</div>
							<div className="bg-black border border-green-400 p-4 text-center">
								<Link
									href="https://scholar.google.com/citations?user=Ls-8CAoAAAAJ&hl=en"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 bg-cyan-400 text-black px-4 py-2 font-mono font-bold hover:bg-yellow-400 transition-colors rounded-none border-2 border-cyan-400 hover:border-yellow-400"
								>
									<Book className="h-4 w-4" />
									[SCHOLAR_PROFILE.EXE]
									<ExternalLink className="h-3 w-3" />
								</Link>
								<div className="text-green-300 font-mono text-xs mt-2">
									Complete publication history available
								</div>
							</div>
						</div>
						<div className="text-green-400 font-mono text-sm mt-4">
							C:\&gt; <span className="animate-pulse">█</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
