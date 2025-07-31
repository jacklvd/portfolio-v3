 
/* eslint-disable react/no-unescaped-entities */
'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import Link from 'next/link';
import { PixelImage } from '@/components/magicui/pixel-image';
import '@/components/styles/about.css';

interface ReadMoreProps {
	children: React.ReactNode;
}
const ReadMore: React.FC<ReadMoreProps> = ({ children }) => {
	const [isReadMore, setIsReadMore] = useState(true);
	const toggleReadMore = () => {
		setIsReadMore(!isReadMore);
	};

	// Extract children if it's a React element with children
	const getChildren = () => {
		if (
			React.isValidElement(children) &&
			children.props &&
			children.props.children
		) {
			return children.props.children;
		}
		return [];
	};

	const childrenArray = getChildren();
	const hasChildren = Array.isArray(childrenArray) && childrenArray.length > 0;

	return (
		<div className="font-mono text-xs sm:text-sm">
			{isReadMore && hasChildren ? childrenArray.slice(0, 2) : children}
			<div className="mt-2">
				<span
					onClick={toggleReadMore}
					className="cursor-pointer text-cyan-400 hover:bg-cyan-400 hover:text-black px-2 py-1 border border-cyan-400 transition-all font-bold text-xs sm:text-sm block sm:inline-block text-center"
				>
					{isReadMore ? '[EXPAND_DATA.EXE]' : '[COLLAPSE_DATA.EXE]'}
				</span>
			</div>
		</div>
	);
};

export function About() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.3,
				delayChildren: 0.2,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.6,
				ease: 'easeOut',
			},
		},
	};

	const bioVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.8,
				ease: 'easeOut',
			},
		},
	};

	const imageVariants = {
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.8,
				ease: 'backOut',
			},
		},
	};

	return (
		<section className="about section py-8 md:py-16 lg:py-24 retro-section text-green-400 font-mono">
			<div className="container mx-auto px-2 sm:px-4">
				<motion.h2
					className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-4 md:mb-2 text-center text-green-400 font-mono"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					&gt; ABOUT.SYS<span className="text-yellow-400 animate-pulse">_</span>
				</motion.h2>

				<motion.div
					className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{/* macOS terminal header */}
					<div className="bg-gray-800 px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-gray-700">
						<div className="flex space-x-1 sm:space-x-2">
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
							<div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
						</div>
						<span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
							jack@portfolio ~ % cd /USER/PROFILE
						</span>
						<div className="w-8 sm:w-16"></div> {/* Spacer for balance */}
					</div>

					<motion.div
						className="p-3 sm:p-4 md:p-6"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
							{/* Profile Image Section */}
							<motion.div
								className="bg-black border border-green-400 p-3 sm:p-4 order-1 lg:order-1"
								variants={itemVariants}
							>
								<motion.div
									className="text-green-400 font-mono text-xs sm:text-sm mb-2"
									variants={itemVariants}
								>
									$ cat user_avatar.jpg
								</motion.div>
								<motion.div
									className="flex justify-center"
									variants={imageVariants}
								>
									<PixelImage src="/images/hero.jpeg" />
								</motion.div>
								<motion.div
									className="text-green-400 font-mono text-xs mt-2 text-center"
									variants={itemVariants}
								>
									[USER_AVATAR.JPG] - 250x250px - STATUS: LOADED
								</motion.div>
							</motion.div>

							{/* Bio Section */}
							<motion.div
								className="bg-black border border-green-400 p-3 sm:p-4 order-2 lg:order-2"
								variants={itemVariants}
							>
								<motion.div
									className="text-green-400 font-mono text-xs sm:text-sm mb-2"
									variants={itemVariants}
								>
									$ cat user_bio.txt
								</motion.div>

								{/* Spotify embed with retro styling */}
								<motion.div
									className="mb-3 sm:mb-4 border-2 border-cyan-400 bg-gray-800"
									variants={itemVariants}
									whileHover={{ scale: 1.02 }}
									transition={{ type: 'spring', stiffness: 300, damping: 10 }}
								>
									<div className="bg-cyan-400 text-black px-2 py-1 font-mono text-xs">
										[AUDIO_STREAM.SPY] - NOW PLAYING
									</div>
									<iframe
										src="https://open.spotify.com/embed/track/7a86XRg84qjasly9f6bPSD?utm_source=generator&theme=0"
										width="100%"
										height="152"
										allowFullScreen
										allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
										loading="lazy"
										className="border-none"
									></iframe>
								</motion.div>

								<motion.div
									className="space-y-2 sm:space-y-3 text-green-300 font-mono text-xs sm:text-sm"
									variants={bioVariants}
								>
									<ReadMore>
										<div className="space-y-2">
											<motion.p
												variants={itemVariants}
												whileHover={{ x: 5 }}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 10,
												}}
											>
												&gt; <span className="text-yellow-400">INIT:</span> Hi,
												I'm Long, but also go by Jack. I'm a computer science
												major student. I'm pursuing a BS degree in Computer
												Science with an incoming MS of Computer Science. I'm
												most passionate about solving real world problems,
												advocating sustainability, and building community-driven
												applications.
											</motion.p>

											<motion.p
												variants={itemVariants}
												whileHover={{ x: 5 }}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 10,
												}}
											>
												&gt; <span className="text-cyan-400">PASSION:</span>{' '}
												Most passionate about solving real world problems,
												advocating sustainability, and building community-driven
												applications.
											</motion.p>

											<motion.p
												variants={itemVariants}
												whileHover={{ x: 5 }}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 10,
												}}
											>
												&gt;{' '}
												<span className="text-yellow-400">EXPERIENCE:</span> I
												appreciate every challenge I came across that helped
												cultivate my self-efficacy in this risk-taking world. At
												STEAM for Vietnam, I have a chance to work with many
												great and talented people to delivery high-end computer
												science course to Vietnamese children. I learned the
												importance of staying open-minded to changes, whether to
												be adapted to new environment, programming languages, or
												attitudes. I feel motivated as I discover ways to
												improve flexibility and creative through ongoing
												discussions with others to address a customer's changing
												needs.
											</motion.p>

											<motion.p
												variants={itemVariants}
												whileHover={{ x: 5 }}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 10,
												}}
											>
												&gt; <span className="text-cyan-400">HOBBIES:</span> I
												love cleaning and organize my workplace. I feel like if
												I can keep my work area clean, I can successfully do
												other things as well. I love reading and listening. I
												used to spend hours to read the History of Greek ~quite
												interesting indeed~. Coming to American, I found out
												that I actually enjoy cooking for my friends as it can
												help me to relieve stress from working and studying.
											</motion.p>

											<motion.p
												variants={itemVariants}
												whileHover={{ x: 5 }}
												transition={{
													type: 'spring',
													stiffness: 400,
													damping: 10,
												}}
											>
												&gt;{' '}
												<span className="text-yellow-400">MOTIVATION:</span> I
												thrive in occupations that promote variety and culture,
												and I appreciate working with people from all walks of
												life to achieve a common goal. Not only do I regard it
												as an opportunity to gain new knowledge, but also to
												connect profoundly with individuals through their
												diverse perspectives on situations. I strive to be a
												team player, to be aware of those around me's needs and
												desires, and to thrive on positive reinforcement.
											</motion.p>
										</div>
									</ReadMore>
								</motion.div>

								<motion.div
									className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-green-400"
									variants={itemVariants}
								>
									<motion.div
										className="text-green-400 font-mono text-xs sm:text-sm mb-2"
										variants={itemVariants}
									>
										$ download resume.pdf
									</motion.div>
									<motion.div
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										transition={{ type: 'spring', stiffness: 400, damping: 10 }}
									>
										<Link
											href="https://drive.google.com/file/d/1gN-lhCCz-NWYVKNDq6OygJCAnqv73LEH/view?usp=sharing"
											className="inline-flex items-center px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium border border-gray-900 dark:border-gray-100 
      rounded-lg shadow-[4px_4px_#121212] dark:shadow-[4px_4px_#e5e5e5] transition-all duration-100 
      text-gray-900 dark:text-gray-100 hover:bg-gray-900 hover:text-black dark:hover:bg-gray-100 dark:hover:text-gray-900
      hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_#121212] dark:hover:shadow-[2px_2px_#e5e5e5] tracking-widest w-full sm:w-auto justify-center"
											target="_blank"
											rel="noopener noreferrer"
										>
											<FileText className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
											[DOWNLOAD_CV.EXE]
										</Link>
									</motion.div>
								</motion.div>

								<motion.div
									className="text-green-400 font-mono text-xs sm:text-sm mt-2"
									variants={itemVariants}
								>
									$ <span className="animate-pulse">█</span>
								</motion.div>
							</motion.div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
