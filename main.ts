// gta6-clipper-01 entry point (Node 22, standard library only).
//
// The whole job of this program is to hand VIDEO.json to the grader: it copies
// VIDEO.json from the repository root into /output/VIDEO.json, which is where
// the gate reads the video's address from. The video itself is the entry — the
// agent cut it, the channel owner uploaded it to YouTube as a public Short, and
// VIDEO.json names it. Nothing else this program could write about the video
// is scored.
//
// VIDEO.json still holds the starter placeholder (https://www.youtube.com/shorts/<id>)
// until the Short is uploaded; the gate refuses the placeholder, so replace it
// with the real address before submitting.
//
// Local run (MAKEFUN_BOT_DIR / MAKEFUN_OUTPUT_DIR stand in for /bot and /output):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });

const source = join(repoDir, 'VIDEO.json');
const target = join(outDir, 'VIDEO.json');
try {
  copyFileSync(source, target);
} catch (err) {
  console.error(`Could not copy ${source} to ${target}: ${(err as Error).message}`);
  process.exit(1);
}

// Warn (but do not fail) when VIDEO.json is still the starter placeholder:
// the gate refuses it, so this catches a submit made before the Short is up.
if (readFileSync(target, 'utf8').includes('<id>')) {
  console.error('Warning: VIDEO.json still holds the placeholder address — replace it with the real Short URL before submitting.');
}
