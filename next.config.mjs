/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
				pathname: '**',
			},
			// GitHub repo social-preview images (for projects sourced from Discussions).
			{
				protocol: 'https',
				hostname: 'opengraph.githubassets.com',
				pathname: '**',
			},
			{
				protocol: 'https',
				hostname: 'raw.githubusercontent.com',
				pathname: '**',
			},
			// Curated hero images for project detail pages (Unsplash, hotlinked).
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
				pathname: '**',
			},
		],
	},
	// Only public identifiers are inlined into the client bundle. SANITY_TOKEN is
	// intentionally NOT here — it's a secret and the public dataset doesn't need it.
	env: {
		SANITY_PROJECT_ID: process.env.SANITY_PROJECT_ID,
		SANITY_DATASET: process.env.SANITY_DATASET,
	},
};

export default nextConfig;
