import { GH_ACCESS_TOKEN } from './client';
import { parseGithubRepo } from './index';

// GitHub's own UI resolves a README's relative image paths against the
// repo's default branch; served as raw markdown and rendered on our domain,
// those same paths 404. Rewrites them to absolute raw.githubusercontent.com
// URLs so images still load. Leaves absolute/protocol-relative/data URLs
// alone.
function resolveRelativeImages(
	markdown: string,
	owner: string,
	repo: string
): string {
	return markdown.replace(
		/(!\[[^\]]*\]\()(?!https?:\/\/|\/\/|data:)\/?([^)]+)(\))/g,
		(_match, prefix, path, suffix) =>
			`${prefix}https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}${suffix}`
	);
}

// Fallback for projects with no custom `detail` write-up in their discussion
// post: fetches the repo's README as raw markdown. Non-fatal — any failure
// (private repo, no README, rate limit, network error) returns '' so the
// detail page still renders with just the card-level description.
export async function fetchReadme(source: string): Promise<string> {
	const repo = parseGithubRepo(source);
	if (!repo) return '';
	try {
		const res = await fetch(
			`https://api.github.com/repos/${repo.owner}/${repo.repo}/readme`,
			{
				headers: {
					Accept: 'application/vnd.github.raw',
					...(GH_ACCESS_TOKEN
						? { Authorization: `token ${GH_ACCESS_TOKEN}` }
						: {}),
				},
				cache: 'no-store',
			}
		);
		if (!res.ok) return '';
		const text = await res.text();
		return resolveRelativeImages(text, repo.owner, repo.repo);
	} catch {
		return '';
	}
}
