import { describe, it, expect } from 'vitest';
import {
	sortByOrder,
	parseGithubRepo,
	slugFromSource,
	parseDetail,
	type GithubProject,
} from './index';

function mk(title: string, order?: number): GithubProject {
	return {
		_id: `gh-${title}`,
		slug: title,
		title,
		description: '',
		detail: '',
		technologies: [],
		source: 'https://github.com/x/y',
		image: '',
		featured: false,
		order: order ?? Number.MAX_SAFE_INTEGER,
	};
}

describe('sortByOrder', () => {
	it('sorts ascending by order, undefined-order items last', () => {
		const out = sortByOrder([mk('c', 3), mk('a', 1), mk('z'), mk('b', 2)]);
		expect(out.map(p => p.title)).toEqual(['a', 'b', 'c', 'z']);
	});
});

describe('parseGithubRepo', () => {
	it('extracts owner and repo from a github.com URL', () => {
		expect(parseGithubRepo('https://github.com/jacklvd/arch-sketch')).toEqual({
			owner: 'jacklvd',
			repo: 'arch-sketch',
		});
	});

	it('strips a trailing .git', () => {
		expect(
			parseGithubRepo('https://github.com/jacklvd/arch-sketch.git')
		).toEqual({
			owner: 'jacklvd',
			repo: 'arch-sketch',
		});
	});

	it('returns null for a non-github source', () => {
		expect(parseGithubRepo('https://example.com/foo')).toBeNull();
	});
});

describe('slugFromSource', () => {
	it('lowercases the repo name from a github source', () => {
		expect(
			slugFromSource('https://github.com/jacklvd/ArchSketch', 'fallback')
		).toBe('archsketch');
	});

	it('falls back when the source is not a github.com URL', () => {
		expect(slugFromSource('https://gitlab.com/x/y', 'gh-3')).toBe('gh-3');
	});
});

describe('parseDetail', () => {
	it('returns the markdown after the proj comment, trimmed', () => {
		const body =
			'Short desc\n\n<!-- proj:{"source":"https://github.com/x/y"} -->\n\n## More\nExtra detail.';
		expect(parseDetail(body)).toBe('## More\nExtra detail.');
	});

	it('returns an empty string when there is no proj comment', () => {
		expect(parseDetail('Just a description, no metadata.')).toBe('');
	});

	it('returns an empty string when nothing follows the comment', () => {
		const body =
			'Short desc\n\n<!-- proj:{"source":"https://github.com/x/y"} -->';
		expect(parseDetail(body)).toBe('');
	});
});
