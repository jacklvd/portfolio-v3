import { GH_ACCESS_TOKEN } from './client';
import { parseGithubRepo } from './index';

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
		return await res.text();
	} catch {
		return '';
	}
}
