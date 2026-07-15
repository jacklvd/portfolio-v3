#!/usr/bin/env node
// Fills in a project's missing image and/or detail write-up using Gemini, then
// writes them back to the source-of-truth GitHub Discussion.
//
//   node --env-file=.env scripts/gen-project.mjs <discussion#> [--force]
//
// - Image  -> Hugging Face (FLUX.1-schnell) -> public/project-images/<slug>.png,
//             path stored in the proj:{...} meta.
// - Detail -> Gemini text -> markdown appended after the proj:{...} comment (what
//             the detail page renders when the repo README is empty/stub).
// Env: GEMINI_API_KEY (text), HF_TOKEN (image), plus the GH_* / GUESTBOOK_* vars.
// Only fills what's MISSING. --force overwrites both; --image / --detail force just
// one. Never commits/pushes (that's on you).

import { writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { InferenceClient } from '@huggingface/inference';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- pure helpers (unit-tested in gen-project.test.ts) ----------------------

export function slugify(title) {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

// The house style shared by every generated card image, so they read as one set.
// Cards render grayscale by default and reveal color on hover, so the palette can
// be rich; anime look with strong tonal contrast that still reads well in grayscale.
const IMAGE_STYLE =
	'Modern anime-style illustration, clean cel shading, soft gradients and cinematic ' +
	'lighting, for a developer portfolio card. Vibrant yet tasteful colors with strong ' +
	'tonal contrast. A single clear focal subject with a simple, uncluttered background ' +
	'and generous empty space; calm and atmospheric, not busy, no crowds. ' +
	'No text or lettering of any kind.';

export function buildImagePrompt(title, description) {
	// FLUX-schnell renders prominent nouns as literal text and largely ignores the
	// "no text" negative, so strip the project name from the concept it depicts.
	const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	let concept = description ?? '';
	for (const n of [title, title.replace(/\s+/g, '')]) {
		concept = concept.replace(new RegExp(esc(n), 'ig'), '');
	}
	concept = concept.replace(/\s+/g, ' ').trim();
	return `${IMAGE_STYLE} Subject: ${concept || 'an abstract geometric composition of simple shapes'}`;
}

export function buildDetailPrompt({ title, description, repo }) {
	const ctx = [
		`Project name: ${title}`,
		description && `Short description: ${description}`,
		repo?.description && `Repo description: ${repo.description}`,
		repo?.topics?.length && `Topics: ${repo.topics.join(', ')}`,
		repo?.languages?.length && `Languages: ${repo.languages.join(', ')}`,
		repo?.files?.length && `Top-level files: ${repo.files.join(', ')}`,
	]
		.filter(Boolean)
		.join('\n');
	return (
		`Write a concise project write-up in GitHub-flavored Markdown for a portfolio detail page. ` +
		`Use a few short "## " sections (e.g. What it does, Highlights, Stack). ` +
		`150-250 words, confident but not salesy. Do NOT repeat the project title as a heading ` +
		`(the page already shows it). Do not invent features you can't infer from the context. ` +
		`Output only the markdown, no code fences around the whole thing.\n\n` +
		`Context:\n${ctx}`
	);
}

const PROJ_RE = /<!--\s*proj:(\{[\s\S]*?\})\s*-->/;

// Split a discussion body into its three logical parts. Mirrors parseMeta/parseDetail
// in lib/projects/index.ts so what we write round-trips with what the site reads.
export function splitBody(body) {
	const m = body.match(PROJ_RE);
	if (!m) return { description: body.trim(), meta: {}, detail: '' };
	let meta = {};
	try {
		meta = JSON.parse(m[1]);
	} catch {
		/* leave {} — a malformed block is treated as absent metadata */
	}
	return {
		description: body.slice(0, m.index).trim(),
		meta,
		detail: body.slice(m.index + m[0].length).trim(),
	};
}

export function rebuildBody({ description, meta, detail }) {
	return [
		description,
		`<!-- proj:${JSON.stringify(meta)} -->`,
		detail,
	]
		.filter(Boolean)
		.join('\n\n');
}

// --- GitHub / Gemini IO -----------------------------------------------------

const GH_API_URL = process.env.GH_API_URL ?? 'https://api.github.com/graphql';
const GH_TOKEN = process.env.GH_ACCESS_TOKEN;
const OWNER = process.env.GUESTBOOK_REPO_OWNER;
const NAME = process.env.GUESTBOOK_REPO_NAME;

// Overridable models. Text: Google (the "-latest" alias, since Google deprecates
// pinned versions for new keys without warning). Image: Hugging Face Inference —
// FLUX.1-schnell is fast, distilled (~4 steps) and Apache-licensed (commercial-OK);
// a free HF token's monthly credit covers a handful of images and can't over-bill.
const TEXT_MODEL = process.env.GEMINI_TEXT_MODEL ?? 'gemini-flash-latest';
const IMAGE_MODEL = process.env.HF_IMAGE_MODEL ?? 'black-forest-labs/FLUX.1-schnell';
// HF's own free serverless provider. "auto" can route to third parties (fal-ai)
// that stall/need their own billing, so pin it; override if you want another.
const HF_PROVIDER = process.env.HF_PROVIDER ?? 'hf-inference';

async function graphql(query, variables) {
	const res = await fetch(GH_API_URL, {
		method: 'POST',
		headers: {
			Authorization: `bearer ${GH_TOKEN}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ query, variables }),
	});
	if (!res.ok)
		throw new Error(`GitHub GraphQL ${res.status}: ${(await res.text()).slice(0, 200)}`);
	const json = await res.json();
	if (json.errors) throw new Error(JSON.stringify(json.errors));
	return json.data;
}

async function ghRest(path) {
	const res = await fetch(`https://api.github.com${path}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			...(GH_TOKEN ? { Authorization: `token ${GH_TOKEN}` } : {}),
		},
	});
	// Non-fatal, but warn so degraded repo context (e.g. a 403 rate-limit) isn't invisible.
	if (!res.ok) console.warn(`  ⚠ GitHub ${path} → ${res.status}`);
	return res.ok ? res.json() : null;
}

function parseRepo(source = '') {
	const m = source.match(/github\.com\/([^/]+)\/([^/?#]+)/);
	return m ? { owner: m[1], repo: m[2].replace(/\.git$/, '') } : null;
}

// A README shorter than this is a stub (e.g. just "# Title") and counts as
// "no real content", so we still draft a detail write-up for it.
// dev-note: 120-char heuristic; bump if a genuinely short README gets overwritten.
const README_STUB_CHARS = 120;

async function isReadmeStub(source) {
	const r = parseRepo(source);
	if (!r) return true;
	const res = await fetch(
		`https://api.github.com/repos/${r.owner}/${r.repo}/readme`,
		{
			headers: {
				Accept: 'application/vnd.github.raw',
				...(GH_TOKEN ? { Authorization: `token ${GH_TOKEN}` } : {}),
			},
		}
	);
	if (!res.ok) return true;
	return (await res.text()).trim().length < README_STUB_CHARS;
}

async function repoContext(source) {
	const r = parseRepo(source);
	if (!r) return null;
	const [meta, langs, tree] = await Promise.all([
		ghRest(`/repos/${r.owner}/${r.repo}`),
		ghRest(`/repos/${r.owner}/${r.repo}/languages`),
		ghRest(`/repos/${r.owner}/${r.repo}/git/trees/HEAD`),
	]);
	return {
		description: meta?.description ?? '',
		topics: meta?.topics ?? [],
		languages: langs ? Object.keys(langs) : [],
		files: (tree?.tree ?? []).map(n => n.path).slice(0, 40),
	};
}

// Turn the project's real purpose into a concrete anime scene (free Gemini call),
// so the image reflects what the project DOES rather than a generic vibe from its
// one-line description. Falls back to the raw description if the call fails.
async function imageConcept(ai, { title, description, repo }) {
	const ctx = [
		`Name: ${title}`,
		description && `What it does: ${description}`,
		repo?.description && `Repo blurb: ${repo.description}`,
		repo?.topics?.length && `Topics: ${repo.topics.join(', ')}`,
	]
		.filter(Boolean)
		.join('\n');
	try {
		const res = await ai.models.generateContent({
			model: TEXT_MODEL,
			contents:
				`You write image-generation prompts. In ONE vivid sentence, describe a single ` +
				`symbolic anime scene that visually captures what this software project DOES — ` +
				`its core purpose or metaphor (e.g. a routing app → a glowing safe path winding ` +
				`through a hazard-lit landscape). Use one concrete central subject. Do NOT mention ` +
				`the project name or any brand, and the scene must contain no text, signs, letters ` +
				`or numbers. Output only the sentence.\n\n${ctx}`,
		});
		return (res.text ?? '').trim() || description;
	} catch {
		return description;
	}
}

async function main() {
	const args = process.argv.slice(2);
	const force = args.includes('--force');
	const forceImage = force || args.includes('--image');
	const forceDetail = force || args.includes('--detail');
	const number = Number(args.find(a => /^\d+$/.test(a)));

	if (!number)
		throw new Error('Usage: gen-project.mjs <discussion#> [--force|--image|--detail]');
	if (!GH_TOKEN || !OWNER || !NAME)
		throw new Error('Missing GH_ACCESS_TOKEN / GUESTBOOK_REPO_OWNER / GUESTBOOK_REPO_NAME');
	if (!process.env.GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

	const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

	const data = await graphql(
		`query($owner:String!,$name:String!,$number:Int!){
			repository(owner:$owner,name:$name){
				discussion(number:$number){ id title body }
			}
		}`,
		{ owner: OWNER, name: NAME, number }
	);
	const discussion = data?.repository?.discussion;
	if (!discussion) throw new Error(`Discussion #${number} not found`);

	const parts = splitBody(discussion.body);
	const { title } = discussion;
	const description = parts.description || discussion.title;
	const source = parts.meta.source ?? '';
	// Fetched once and shared by both the image concept and the detail write-up.
	const repo = source ? await repoContext(source) : null;
	let changed = false;
	let newImagePath = ''; // set only when we write a local PNG this run

	// --- image via Hugging Face (non-fatal: a failure shouldn't sink detail) ---
	if (!parts.meta.image || forceImage) {
		try {
			if (!process.env.HF_TOKEN) throw new Error('Missing HF_TOKEN');
			console.log('→ deriving visual concept…');
			const concept = await imageConcept(ai, { title, description, repo });
			console.log(`  concept: ${concept.slice(0, 120)}`);
			console.log(`→ generating image (HF: ${IMAGE_MODEL})…`);
			const hf = new InferenceClient(process.env.HF_TOKEN);
			const blob = await hf.textToImage({
				provider: HF_PROVIDER,
				model: IMAGE_MODEL,
				inputs: buildImagePrompt(title, concept),
				// schnell is distilled for ~4 steps; 1024x576 is 16:9 and /16-clean.
				parameters: { num_inference_steps: 4, width: 1024, height: 576 },
			});
			const bytes = Buffer.from(await blob.arrayBuffer());
			const ext = blob.type === 'image/png' ? 'png' : 'jpg';
			// Content hash in the filename busts next/image + browser + CDN caches on
			// regenerate — the URL changes, so no stale image is ever served.
			const slug = slugify(title);
			const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8);
			const dir = join(ROOT, 'public', 'project-images');
			mkdirSync(dir, { recursive: true });
			const file = `${slug}-${hash}.${ext}`;
			// Drop this slug's previous image(s) — old hash and legacy unhashed — so
			// regenerations don't accumulate orphaned files.
			const prev = new RegExp(`^${slug}(-[0-9a-f]{8})?\\.(jpg|png)$`);
			for (const f of readdirSync(dir))
				if (f !== file && prev.test(f)) rmSync(join(dir, f));
			writeFileSync(join(dir, file), bytes);
			const rel = `/project-images/${file}`;
			parts.meta.image = rel;
			newImagePath = rel;
			changed = true;
			console.log(`  wrote public${rel} (${(bytes.length / 1024).toFixed(0)} KB)`);
		} catch (e) {
			console.warn(`  ⚠ image skipped: ${e.message.slice(0, 160)}`);
		}
	} else {
		console.log('· image present, skipping (use --force to regenerate)');
	}

	// --- detail ---
	const needDetail = forceDetail || (!parts.detail && (await isReadmeStub(source)));
	if (needDetail) {
		if (!source) {
			console.log('· no repo source in proj meta, skipping detail');
		} else {
			console.log('→ generating detail…');
			const res = await ai.models.generateContent({
				model: TEXT_MODEL,
				contents: buildDetailPrompt({ title, description, repo }),
			});
			parts.detail = (res.text ?? '').trim();
			changed = parts.detail.length > 0 || changed;
			console.log(`  drafted ${parts.detail.length} chars of detail`);
		}
	} else {
		console.log('· detail present or repo has a README, skipping');
	}

	if (!changed) {
		console.log('Nothing to do.');
		return;
	}

	await graphql(
		`mutation($id:ID!,$body:String!){
			updateDiscussion(input:{discussionId:$id,body:$body}){ discussion{ number } }
		}`,
		{ id: discussion.id, body: rebuildBody(parts) }
	);
	console.log(`✓ updated discussion #${number}.`);
	if (newImagePath)
		console.log(`  commit public${newImagePath} to deploy the image.`);
}

// Only run when executed directly, so the test can import the pure helpers.
// pathToFileURL handles spaces/special chars in the path (a raw `file://` + path
// concat would mis-compare and either skip main() or run it during test import).
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	main().catch(err => {
		console.error(err.message);
		process.exit(1);
	});
}
