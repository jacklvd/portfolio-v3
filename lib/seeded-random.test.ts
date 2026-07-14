import { describe, it, expect } from 'vitest';
import { seededRandom } from './seeded-random';

describe('seededRandom', () => {
	// Golden values. These pin the exact algorithm: SSR and the browser both run
	// it and must agree bit-for-bit, so a change here is a hydration mismatch.
	it('produces the exact expected sequence', () => {
		expect([0, 1, 2, 3, 42].map(seededRandom)).toEqual([
			0.26642920868471265, 0.6270739405881613, 0.7342509443406016,
			0.7202267837710679, 0.6011037519201636,
		]);
	});

	it('stays in [0, 1) across a wide seed range', () => {
		for (let i = 0; i < 2000; i++) {
			const v = seededRandom(i);
			expect(v).toBeGreaterThanOrEqual(0);
			expect(v).toBeLessThan(1);
		}
	});

	it('is deterministic for a repeated seed', () => {
		expect(seededRandom(7)).toBe(seededRandom(7));
	});
});
