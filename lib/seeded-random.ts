// mulberry32.
//
// Must stay integer/bitwise-only. ECMAScript specifies these ops exactly, so
// the server and the browser produce bit-identical results — which is the whole
// point: this seeds SSR-rendered decoration, and any drift between engines is a
// hydration mismatch.
//
// The previous implementation was `Math.sin(seed) * 10000`, fractional part.
// Math.sin is NOT required to be correctly rounded, so engines disagree in the
// last bits, and the ×10000-then-fract amplified those bits into the leading
// digits. Do not reintroduce Math.sin (or any other transcendental) here.
export function seededRandom(seed: number): number {
	let t = (seed + 0x6d2b79f5) | 0;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
