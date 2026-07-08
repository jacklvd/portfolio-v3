import { describe, it, expect, vi, afterEach } from 'vitest';
import { fetchReadme } from './readme';

describe('fetchReadme', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns the README text on a successful fetch', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve('# Hello'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/arch-sketch');
		expect(result).toBe('# Hello');
	});

	it('returns an empty string on a non-ok response', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: false, text: () => Promise.resolve('') })
		);
		const result = await fetchReadme('https://github.com/jacklvd/arch-sketch');
		expect(result).toBe('');
	});

	it('returns an empty string for a non-github source without calling fetch', async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal('fetch', fetchMock);
		const result = await fetchReadme('https://example.com/foo');
		expect(result).toBe('');
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('returns an empty string when fetch throws', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
		const result = await fetchReadme('https://github.com/jacklvd/arch-sketch');
		expect(result).toBe('');
	});

	it('rewrites a repo-relative image path to raw.githubusercontent.com', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve('![alt text](assets/image.png)'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe(
			'![alt text](https://raw.githubusercontent.com/jacklvd/lifepub/HEAD/assets/image.png)'
		);
	});

	it('strips a leading slash from a repo-root-relative image path', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve('![alt text](/assets/image.png)'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe(
			'![alt text](https://raw.githubusercontent.com/jacklvd/lifepub/HEAD/assets/image.png)'
		);
	});

	it('leaves already-absolute image URLs untouched', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve('![alt text](https://example.com/image.png)'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe('![alt text](https://example.com/image.png)');
	});

	it('leaves protocol-relative image URLs untouched', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () => Promise.resolve('![alt text](//example.com/image.png)'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe('![alt text](//example.com/image.png)');
	});

	it('leaves data URIs untouched', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve('![alt text](data:image/png;base64,abc123)'),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe('![alt text](data:image/png;base64,abc123)');
	});

	it('rewrites every relative image in a multi-image README', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				text: () =>
					Promise.resolve(
						'![one](assets/a.png)\n\ntext\n\n![two](assets/b.png)'
					),
			})
		);
		const result = await fetchReadme('https://github.com/jacklvd/lifepub');
		expect(result).toBe(
			'![one](https://raw.githubusercontent.com/jacklvd/lifepub/HEAD/assets/a.png)\n\n' +
				'text\n\n' +
				'![two](https://raw.githubusercontent.com/jacklvd/lifepub/HEAD/assets/b.png)'
		);
	});
});
