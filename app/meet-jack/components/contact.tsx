'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Send, Mail, Github, Linkedin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
	name: z.string().min(2, {
		message: 'Name must be at least 2 characters.',
	}),
	email: z.string().email({
		message: 'Please enter a valid email address.',
	}),
	message: z.string().min(10, {
		message: 'Message must be at least 10 characters.',
	}),
});

export function ContactSection() {
	const [isSubmitting, setIsSubmitting] = useState(false);

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			email: '',
			message: '',
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		setIsSubmitting(true);

		// Simulate form submission
		setTimeout(() => {
			setIsSubmitting(false);
			form.reset();

			toast({
				title: 'Message sent!',
				description: 'Thank you for reaching out. I will get back to you soon.',
			});
		}, 1500);

		// In a real implementation, you would send this data to your backend
		console.log(values);
	}

	const socialLinks = [
		{
			name: 'Email',
			icon: <Mail className="h-5 w-5" />,
			href: 'mailto:your.email@example.com',
			label: 'your.email@example.com',
		},
		{
			name: 'GitHub',
			icon: <Github className="h-5 w-5" />,
			href: 'https://github.com/jacklvd',
			label: 'github.com/jacklvd',
		},
		{
			name: 'LinkedIn',
			icon: <Linkedin className="h-5 w-5" />,
			href: 'https://linkedin.com/in/yourusername',
			label: 'linkedin.com/in/yourusername',
		},
	];

	return (
		<section
			id="contact"
			className="py-16 md:py-24 retro-section text-green-400 font-mono"
		>
			<div className="container mx-auto px-4">
				<h2 className="text-3xl font-bold tracking-tight mb-2 text-center text-green-400 font-mono">
					&gt; CONTACT.COM
					<span className="text-yellow-400 animate-pulse">_</span>
				</h2>
				<p className="text-green-300 text-center mb-12 font-mono text-sm max-w-md mx-auto">
					[ESTABLISHING CONNECTION...] █████████████ 100%
				</p>

				<div className="max-w-4xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
					{/* macOS terminal header */}
					<div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
						<div className="flex space-x-2">
							<div className="w-3 h-3 bg-red-500 rounded-full"></div>
							<div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
							<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						</div>
						<span className="font-mono text-sm text-gray-300">
							jack@portfolio ~ % cd /COMMUNICATION
						</span>
						<div className="w-16"></div>
					</div>

					<div className="p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Contact Info */}
							<motion.div
								className="bg-black border border-green-400 p-4"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5 }}
							>
								<div className="text-green-400 font-mono text-sm mb-4">
									C:\&gt; cat contact_info.txt
								</div>

								<h3 className="text-yellow-400 font-mono font-bold mb-4">
									&gt; AVAILABLE_CHANNELS
								</h3>

								<div className="space-y-3">
									{socialLinks.map((link, index) => (
										<a
											key={link.name}
											href={link.href}
											target="_blank"
											rel="noreferrer"
											className="block p-3 border border-green-400 hover:border-yellow-400 hover:bg-green-900 transition-all group"
										>
											<div className="flex items-center gap-3">
												<div className="flex-shrink-0 h-8 w-8 bg-green-400 text-black rounded-none flex items-center justify-center group-hover:bg-yellow-400 transition-colors">
													{link.icon}
												</div>
												<div>
													<p className="font-mono font-bold text-green-400 group-hover:text-yellow-400">
														[{String(index + 1).padStart(2, '0')}]{' '}
														{link.name.toUpperCase()}
													</p>
													<p className="text-sm text-green-300 font-mono">
														{link.label}
													</p>
												</div>
											</div>
										</a>
									))}
								</div>

								<div className="mt-6 pt-4 border-t border-green-400">
									<div className="text-cyan-400 font-mono text-sm">
										[STATUS]: AVAILABLE FOR NEW OPPORTUNITIES
									</div>
									<div className="text-green-300 font-mono text-sm mt-1">
										[MODE]: COLLABORATIVE_PROJECTS_ACCEPTED
									</div>
								</div>

								<div className="text-green-400 font-mono text-sm mt-4">
									C:\&gt; <span className="animate-pulse">█</span>
								</div>
							</motion.div>

							{/* Contact Form */}
							<motion.div
								className="bg-black border border-green-400 p-4"
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.5, delay: 0.2 }}
							>
								<div className="text-green-400 font-mono text-sm mb-4">
									C:\&gt; run message_sender.exe
								</div>

								<Form {...form}>
									<form
										onSubmit={form.handleSubmit(onSubmit)}
										className="space-y-4"
									>
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-cyan-400 font-mono text-sm">
														[INPUT_NAME]:
													</FormLabel>
													<FormControl>
														<Input
															placeholder="Enter your name..."
															className="bg-gray-800 border-green-400 text-green-300 font-mono rounded-none focus:border-yellow-400 placeholder:text-green-600"
															{...field}
														/>
													</FormControl>
													<FormMessage className="text-red-400 font-mono text-xs" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-cyan-400 font-mono text-sm">
														[INPUT_EMAIL]:
													</FormLabel>
													<FormControl>
														<Input
															placeholder="user@domain.com"
															className="bg-gray-800 border-green-400 text-green-300 font-mono rounded-none focus:border-yellow-400 placeholder:text-green-600"
															{...field}
														/>
													</FormControl>
													<FormMessage className="text-red-400 font-mono text-xs" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="message"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-cyan-400 font-mono text-sm">
														[INPUT_MESSAGE]:
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Type your message here..."
															className="bg-gray-800 border-green-400 text-green-300 font-mono rounded-none focus:border-yellow-400 placeholder:text-green-600 min-h-[100px]"
															{...field}
														/>
													</FormControl>
													<FormMessage className="text-red-400 font-mono text-xs" />
												</FormItem>
											)}
										/>

										<Button
											type="submit"
											className="w-full bg-green-400 text-black font-mono font-bold rounded-none border-2 border-green-400 hover:bg-yellow-400 hover:border-yellow-400 transition-colors"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<span className="animate-pulse mr-2">⚡</span>
													[TRANSMITTING...]
												</>
											) : (
												<>
													<Send className="mr-2 h-4 w-4" />
													[SEND_MESSAGE.EXE]
												</>
											)}
										</Button>
									</form>
								</Form>

								<div className="text-green-400 font-mono text-sm mt-4">
									C:\&gt; <span className="animate-pulse">█</span>
								</div>
							</motion.div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
