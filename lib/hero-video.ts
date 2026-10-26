/**
 * The landing page's main video, served from our own origin.
 *
 * It used to be a Loom embed, which could not show a frame until Loom's player
 * had booted — seconds of third-party JS ahead of the first video byte. The
 * file here is Loom's own transcode (session b62017a7639543548f22b1b3e5f7392e),
 * remuxed with faststart so playback can begin on the first bytes, and the
 * poster is its own frame rather than a remote thumbnail.
 *
 * These paths are cached for a year (see next.config.ts), so a re-record
 * ships under a NEW filename rather than overwriting these.
 *
 * To refresh it after a re-record: POST to
 * https://www.loom.com/api/campaigns/sessions/<id>/transcoded-url, then
 * `ffmpeg -i in.mp4 -c copy -movflags +faststart public/video/vsl.mp4`.
 */
export const HERO_VIDEO_SRC = "/video/vsl.mp4";

export const HERO_VIDEO_POSTER = "/video/vsl-poster.jpg";

/** The Loom original, still used by the education section's click-to-play embed. */
export const HERO_VIDEO_ID = "b62017a7639543548f22b1b3e5f7392e";

export const HERO_VIDEO_LOOM_THUMBNAIL =
  "https://cdn.loom.com/sessions/thumbnails/b62017a7639543548f22b1b3e5f7392e-34e073a79aaafefe.jpg";
