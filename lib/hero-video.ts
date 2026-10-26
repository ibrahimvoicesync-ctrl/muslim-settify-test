/**
 * The landing page's main video. Kept here so the player, the fallback embed
 * and the <head> preload all point at the same asset.
 *
 * Loom rotates the hash on thumbnail URLs; a stale one 403s, which leaves the
 * player with nothing to show while it boots. Re-read it from
 * https://www.loom.com/v1/oembed?url=https://www.loom.com/share/<id> if the
 * poster ever stops rendering.
 */
export const HERO_VIDEO_ID = "b62017a7639543548f22b1b3e5f7392e";

/** Static frame — a third the weight of Loom's animated GIF, and it is blurred anyway. */
export const HERO_VIDEO_POSTER =
  "https://cdn.loom.com/sessions/thumbnails/b62017a7639543548f22b1b3e5f7392e-34e073a79aaafefe.jpg";
