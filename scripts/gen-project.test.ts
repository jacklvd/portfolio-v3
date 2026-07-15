import { describe, it, expect } from 'vitest';
import { slugify, splitBody, rebuildBody, buildImagePrompt } from './gen-project.mjs';

describe('slugify', () => {
	it('makes filesystem-safe slugs', () => {
		expect(slugify('Sidekick Cat')).toBe('sidekick-cat');
		expect(slugify('SmartSheet')).toBe('smartsheet');
		expect(slugify('  Foo/Bar!! ')).toBe('foo-bar');
	});
});

describe('buildImagePrompt', () => {
	it('strips the project name so schnell has no noun to render as text', () => {
		const p = buildImagePrompt('HazardHub', 'HazardHub is a safety platform for communities');
		expect(p).not.toMatch(/HazardHub/i);
		expect(p).toContain('safety platform');
	});

	it('strips the spaceless form of a multi-word title too', () => {
		const p = buildImagePrompt('Smart Sheet', 'SmartSheet summarizes content into README');
		expect(p).not.toMatch(/smartsheet/i);
	});

	it('falls back to an abstract subject when nothing is left', () => {
		const p = buildImagePrompt('Foo', 'Foo');
		expect(p).toContain('abstract geometric composition');
	});
});

describe('splitBody / rebuildBody', () => {
	const meta = { source: 'https://github.com/jacklvd/smartsheet', order: 1 };

	it('splits description, meta, and detail', () => {
		const body = `A neat tool.\n\n<!-- proj:${JSON.stringify(meta)} -->\n\n## What it does\nStuff.`;
		const p = splitBody(body);
		expect(p.description).toBe('A neat tool.');
		expect(p.meta).toEqual(meta);
		expect(p.detail).toBe('## What it does\nStuff.');
	});

	it('treats a body with no proj comment as pure description', () => {
		const p = splitBody('Just a description, no meta.');
		expect(p).toEqual({
			description: 'Just a description, no meta.',
			meta: {},
			detail: '',
		});
	});

	it('round-trips: split(rebuild(x)) preserves all three parts', () => {
		const parts = { description: 'Desc.', meta, detail: '## Stack\nFlask, Next.' };
		const again = splitBody(rebuildBody(parts));
		expect(again).toEqual(parts);
	});

	it('rebuild keeps a still-empty detail from producing a trailing block', () => {
		const body = rebuildBody({ description: 'Desc.', meta, detail: '' });
		expect(body).toBe(`Desc.\n\n<!-- proj:${JSON.stringify(meta)} -->`);
		// and the site's regex still reads the meta back
		expect(splitBody(body).meta).toEqual(meta);
	});
});
