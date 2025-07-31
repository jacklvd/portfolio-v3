'use client';
import React, { useState, useEffect } from 'react';
import { client } from '@/client/client';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface Experience {
	_id: string;
	position: string;
	company: string;
	date: string;
	url: string;
	description: string[];
}

const itemVariants = {
	hidden: { opacity: 0, x: -10 },
	visible: (custom: number) => ({
		opacity: 1,
		x: 0,
		transition: {
			delay: custom * 0.2, // Each item will appear one after the other
		},
	}),
};

const ExperienceSection: React.FC = () => {
	const [experiences, setExperiences] = useState<Experience[]>([]);
	const [selectedId, setSelectedId] = useState<string>('');
	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [isDropdownOpen, setDropdownOpen] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setIsMobile(window.innerWidth < 768);
			const handleResize = () => {
				setIsMobile(window.innerWidth < 768);
			};
			window.addEventListener('resize', handleResize);
			return () => {
				window.removeEventListener('resize', handleResize);
			};
		}
	}, []);

	useEffect(() => {
		const fetchExperiences = async () => {
			const query = `*[_type == "experience"] | order(date desc) {
                _id,
                position,
                company,
                date,
                url,
                description
            }`;
			try {
				const fetchedExperiences = await client.fetch(query);
				setExperiences(fetchedExperiences);
				if (fetchedExperiences.length > 0) {
					setSelectedId(fetchedExperiences[0]._id);
				}
			} catch (error) {
				console.error('Failed to fetch experiences:', error);
			}
		};
		fetchExperiences();
	}, []);

	const selectedExperience =
		experiences.find(exp => exp._id === selectedId) || experiences[0];

	const toggleDropdown = () => {
		setDropdownOpen(!isDropdownOpen);
	};

	const selectCompany = (id: string) => {
		setSelectedId(id);
		setDropdownOpen(false);
	};

	if (experiences.length === 0)
		return (
			<div className="flex justify-center items-center min-h-[200px]">
				<div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
			</div>
		);

	return (
		<section
			className="py-16 md:py-24 retro-section text-green-400 font-mono"
			id="experience"
		>
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold tracking-tight mb-2 text-center text-green-400 font-mono">
					&gt; EXPERIENCE.EXE
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
							jack@portfolio ~ % cd /EXPERIENCE
						</span>
						<div className="w-8 sm:w-16"></div>
					</div>

					<div className="p-6">
						<div className="flex flex-col md:flex-row">
							{/* Company list */}
							<div
								className={`w-full md:w-64 md:flex-none ${isMobile ? 'mb-4' : 'pr-6'}`}
							>
								{isMobile ? (
									<div className="md:hidden w-full mb-4">
										<div
											className="bg-green-400 text-black p-3 border-2 border-green-300 flex justify-between items-center cursor-pointer font-mono font-bold hover:bg-yellow-400 transition-colors"
											onClick={toggleDropdown}
										>
											<span className="font-mono">
												&gt; {selectedExperience.company}
											</span>
											<ChevronDown
												className={`transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
											/>
										</div>
										{isDropdownOpen && (
											<div className="mt-2 bg-black border-2 border-green-400 overflow-hidden">
												{experiences.map((exp, index) => (
													<div
														key={exp._id}
														className={`p-3 cursor-pointer hover:bg-green-900 transition-colors font-mono ${
															selectedId === exp._id
																? 'text-yellow-400 bg-green-800 border-l-4 border-yellow-400'
																: 'text-green-400'
														}`}
														onClick={() => selectCompany(exp._id)}
													>
														[{String(index + 1).padStart(2, '0')}] {exp.company}
													</div>
												))}
											</div>
										)}
									</div>
								) : (
									<div className="space-y-1 border-r-2 border-green-400 pr-4">
										{experiences.map((exp, index) => (
											<div
												key={exp._id}
												className={`px-4 py-2 text-sm cursor-pointer hover:text-yellow-400 transition-colors duration-200 font-mono border-l-2 ${
													selectedId === exp._id
														? 'text-yellow-400 border-yellow-400 bg-green-900 font-bold'
														: 'text-green-400 border-transparent hover:border-green-400'
												}`}
												onClick={() => setSelectedId(exp._id)}
											>
												[{String(index + 1).padStart(2, '0')}] {exp.company}
											</div>
										))}
									</div>
								)}
							</div>

							{/* Experience details */}
							<div className="flex-grow md:pl-6">
								<div className="mb-4">
									<span className="text-xl font-bold text-yellow-400 font-mono">
										&gt; {selectedExperience.position}
									</span>{' '}
									<a
										href={selectedExperience.url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-cyan-400 hover:text-black underline font-mono hover:bg-cyan-400 transition-all px-1"
									>
										@ {selectedExperience.company}
									</a>
								</div>
								<p className="text-sm text-green-300 my-2 font-mono">
									[DATE]: {selectedExperience.date}
								</p>

								<div className="mt-4 bg-black border border-green-400 p-4">
									<div className="text-green-400 font-mono text-sm mb-2">
										C:\&gt; cat responsibilities.txt
									</div>
									<ul className="space-y-2">
										{selectedExperience.description.map((des, index) => (
											<motion.li
												key={`${selectedExperience._id}-${index}`}
												variants={itemVariants}
												initial="hidden"
												animate="visible"
												custom={index}
												className="flex items-start gap-2 font-mono text-sm"
											>
												<span className="text-yellow-400 mt-1 font-bold">
													&gt;
												</span>
												<span className="text-green-300">{des}</span>
											</motion.li>
										))}
									</ul>
									<div className="text-green-400 font-mono text-sm mt-2">
										C:\&gt; <span className="animate-pulse">█</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default ExperienceSection;
