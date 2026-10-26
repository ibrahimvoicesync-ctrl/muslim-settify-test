/**
 * The student-results grid: ten testimonials, each with a short preview loop we
 * host ourselves and the full YouTube video behind it.
 *
 * The grid used to autoplay ten YouTube iframes. That cost ~1MB of player JS
 * per card before anything moved, and iOS refuses muted iframe autoplay often
 * enough that phones just sat on a blurred thumbnail. A plain
 * `<video muted playsInline>` autoplays everywhere, so each card now loops a
 * ~20s silent clip from our own origin and only loads YouTube — full length,
 * with sound — once someone clicks.
 *
 * The clips are built by `node scripts/build-testimonial-clips.mjs`, which
 * fetches only the seconds it needs rather than the 2h51m these add up to.
 *
 * /video/* is cached for a year (next.config.ts), so the version token below
 * is what lets a re-encode reach anyone: bump it HERE and in the script
 * together, never overwrite a clip in place.
 */
export const CLIP_VERSION = "v1";

export type VideoTestimonial = {
  id: number;
  name: string;
  stat: string;
  location: string;
  /** Filename stem under /video/clips, and the key the build script uses. */
  slug: string;
  /** The full video, loaded only on click. */
  videoId: string;
};

export const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Aqib",
    stat: "Setter to Closer to $20k p/m biz owner",
    location: "UAE (Muhajir)",
    slug: "aqib",
    videoId: "tE-AMxW_p7I",
  },
  {
    id: 2,
    name: "Abdul Rahman",
    stat: "Hit $3k p/m around two months into joining Settify",
    location: "UAE",
    slug: "abdul-rahman",
    videoId: "nldZCR5Z5WQ",
  },
  {
    id: 3,
    name: "Abu Umar",
    stat: "Made $7k per month and topped setters",
    location: "Australia",
    slug: "abu-umar",
    videoId: "lVXfYihW0Kk",
  },
  {
    id: 4,
    name: "Abu Abdullah",
    stat: "Made $3.5k in 7 weeks on a role",
    location: "Germany / Turkey",
    slug: "abu-abdullah",
    videoId: "VTlRSGw4NFg",
  },
  {
    id: 5,
    name: "Melih",
    stat: "Making $5k+ per month as an offer manager",
    location: "United Kingdom",
    slug: "melih",
    videoId: "_deei-l1AS0",
  },
  {
    id: 6,
    name: "Abu Anas",
    stat: "Made $6k p/m and $50,000+ around 19 y.o",
    location: "Bangladesh",
    slug: "abu-anas",
    videoId: "akAtGqiYYUk",
  },
  {
    id: 7,
    name: "Jiri",
    stat: "Landed setter role with $3k base then made $23,000+",
    location: "Riyadh (Student of Knowledge)",
    slug: "jiri",
    videoId: "oh3-3msxrFk",
  },
  {
    id: 8,
    name: "Mohammad Shahul",
    stat: "Made $2.7k in a month on his role at approx 18 y.o",
    location: "Dubai",
    slug: "mohammad-shahul",
    videoId: "-t3PGWmcTZ4",
  },
  {
    id: 9,
    name: "Mohammad Hussein",
    stat: "Made $5k+ per month and closed over $600k+",
    location: "Sharjah (Muhajir)",
    slug: "mohammad-hussein",
    videoId: "cjDPLAlrLIM",
  },
  {
    id: 10,
    name: "Khalid",
    stat: "Made $2-3k p/m supporting his family",
    location: "Malaysia (Muhajir)",
    slug: "khalid",
    videoId: "8b1bkMiTUJo",
  },
];

export function clipSrc(slug: string): string {
  return `/video/clips/${slug}.${CLIP_VERSION}.mp4`;
}

/** The clip's own first frame, so the handover to video has nothing to fade. */
export function clipPoster(slug: string): string {
  return `/video/clips/${slug}.${CLIP_VERSION}.jpg`;
}
