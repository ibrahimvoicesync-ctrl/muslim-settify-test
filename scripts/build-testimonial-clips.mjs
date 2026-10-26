/**
 * Builds the silent preview loops the student-results grid autoplays.
 *
 * The grid used to autoplay ten YouTube iframes. That is ~1MB of player JS per
 * card before the first frame, and iOS refuses muted iframe autoplay often
 * enough that phones just saw a blurred thumbnail. A plain <video muted
 * playsInline> always autoplays, so each card now loops a short clip we host
 * ourselves and hands off to YouTube — full length, with sound — on click.
 *
 * Only CLIP_SECONDS are fetched per video (yt-dlp --download-sections), so this
 * pulls a few MB rather than the 2h51m the ten videos add up to.
 *
 * Re-running overwrites the files in place, and /video/* is cached for a year
 * (next.config.ts) — so bump VERSION when you change the encode, which changes
 * every filename and sidesteps the stale cache.
 *
 *   node scripts/build-testimonial-clips.mjs
 */
import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

/** Bump when the encode changes: it renames every output past the year cache. */
const VERSION = "v1";
/** Skipped from the head of each video, to miss fades and title cards. */
const CLIP_START = 3;
const CLIP_SECONDS = 20;
/** Card is ~455 CSS px wide at the grid's widest; 540p covers it on retina. */
const CLIP_HEIGHT = 540;

const OUT_DIR = path.resolve("public/video/clips");
const WORK_DIR = path.resolve("node_modules/.cache/testimonial-clips");

/** Keep in sync with videoTestimonials in components/video-testimonials.tsx. */
const CLIPS = [
  { slug: "aqib", id: "tE-AMxW_p7I" },
  { slug: "abdul-rahman", id: "nldZCR5Z5WQ" },
  { slug: "abu-umar", id: "lVXfYihW0Kk" },
  { slug: "abu-abdullah", id: "VTlRSGw4NFg" },
  { slug: "melih", id: "_deei-l1AS0" },
  { slug: "abu-anas", id: "akAtGqiYYUk" },
  { slug: "jiri", id: "oh3-3msxrFk" },
  { slug: "mohammad-shahul", id: "-t3PGWmcTZ4" },
  { slug: "mohammad-hussein", id: "cjDPLAlrLIM" },
  { slug: "khalid", id: "8b1bkMiTUJo" },
];

async function download(id, slug) {
  const target = path.join(WORK_DIR, `${slug}.mp4`);
  await rm(target, { force: true });
  await run("yt-dlp", [
    "--no-playlist",
    "--force-keyframes-at-cuts",
    "--download-sections",
    `*${CLIP_START}-${CLIP_START + CLIP_SECONDS + 2}`,
    "-f",
    "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    "--merge-output-format",
    "mp4",
    "-o",
    target,
    `https://www.youtube.com/watch?v=${id}`,
  ]);
  return target;
}

async function encode(source, slug) {
  const clip = path.join(OUT_DIR, `${slug}.${VERSION}.mp4`);
  const poster = path.join(OUT_DIR, `${slug}.${VERSION}.jpg`);

  await run("ffmpeg", [
    "-y",
    "-i", source,
    "-t", String(CLIP_SECONDS),
    // Silent: the card is muted either way, and the audio track is pure weight.
    "-an",
    "-vf", `scale=-2:${CLIP_HEIGHT}:flags=lanczos,fps=24`,
    "-c:v", "libx264",
    "-profile:v", "main",
    "-preset", "slow",
    "-crf", "30",
    // Loops seamlessly and seeks cheaply at this length.
    "-g", "48",
    "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    clip,
  ]);

  // The poster is the clip's own first frame, so there is nothing to cross-fade
  // when the video takes over.
  await run("ffmpeg", ["-y", "-i", clip, "-frames:v", "1", "-q:v", "4", poster]);

  return { clip, poster };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(WORK_DIR, { recursive: true });

  for (const { slug, id } of CLIPS) {
    process.stdout.write(`${slug} (${id}) ... `);
    try {
      const source = await download(id, slug);
      const { clip } = await encode(source, slug);
      const { size } = await import("node:fs").then((fs) =>
        fs.promises.stat(clip)
      );
      console.log(`${(size / 1e6).toFixed(1)}MB`);
    } catch (error) {
      console.log("FAILED");
      console.error(error.stderr ?? error.message);
      process.exitCode = 1;
    }
  }
}

await main();
