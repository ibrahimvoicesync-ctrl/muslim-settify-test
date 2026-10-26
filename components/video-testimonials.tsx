"use client";

import { motion } from "framer-motion";

import { AutoplayPreviewEmbed } from "@/components/ui/autoplay-preview-embed";

type VideoTestimonial = {
  id: number;
  name: string;
  stat: string;
  location: string;
  videoId: string;
};

const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Aqib",
    stat: "Setter to Closer to $20k p/m biz owner",
    location: "UAE (Muhajir)",
    videoId: "tE-AMxW_p7I",
  },
  {
    id: 2,
    name: "Abdul Rahman",
    stat: "Hit $3k p/m around two months into joining Settify",
    location: "UAE",
    videoId: "nldZCR5Z5WQ",
  },
  {
    id: 3,
    name: "Abu Umar",
    stat: "Made $7k per month and topped setters",
    location: "Australia",
    videoId: "lVXfYihW0Kk",
  },
  {
    id: 4,
    name: "Abu Abdullah",
    stat: "Made $3.5k in 7 weeks on a role",
    location: "Germany / Turkey",
    videoId: "VTlRSGw4NFg",
  },
  {
    id: 5,
    name: "Melih",
    stat: "Making $5k+ per month as an offer manager",
    location: "United Kingdom",
    videoId: "_deei-l1AS0",
  },
  {
    id: 6,
    name: "Abu Anas",
    stat: "Made $6k p/m and $50,000+ around 19 y.o",
    location: "Bangladesh",
    videoId: "akAtGqiYYUk",
  },
  {
    id: 7,
    name: "Jiri",
    stat: "Landed setter role with $3k base then made $23,000+",
    location: "Riyadh (Student of Knowledge)",
    videoId: "oh3-3msxrFk",
  },
  {
    id: 8,
    name: "Mohammad Shahul",
    stat: "Made $2.7k in a month on his role at approx 18 y.o",
    location: "Dubai",
    videoId: "-t3PGWmcTZ4",
  },
  {
    id: 9,
    name: "Mohammad Hussein",
    stat: "Made $5k+ per month and closed over $600k+",
    location: "Sharjah (Muhajir)",
    videoId: "cjDPLAlrLIM",
  },
  {
    id: 10,
    name: "Khalid",
    stat: "Made $2-3k p/m supporting his family",
    location: "Malaysia (Muhajir)",
    videoId: "8b1bkMiTUJo",
  },
];

export const YOUTUBE_VIDEO_IDS: string[] = videoTestimonials.map(
  (testimonial) => testimonial.videoId
);

function TestimonialCard({
  testimonial,
  eager,
}: {
  testimonial: VideoTestimonial;
  eager: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 1, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        },
      }}
      className="flex flex-col gap-5"
    >
      <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-[#0066FF]/20 bg-white">
        <AutoplayPreviewEmbed
          id={testimonial.videoId}
          title={`${testimonial.name} — ${testimonial.stat}`}
          className="w-full h-full"
          eager={eager}
        />
      </div>
      <div className="text-center px-2">
        <h3 className="text-xl md:text-2xl font-bold text-[#1A202C]">
          {testimonial.name}
        </h3>
        <p className="text-base md:text-lg text-[#0066FF] font-bold mt-2 leading-snug">
          {testimonial.stat}
        </p>
        <p className="text-sm md:text-base text-[#718096] mt-1">
          Location: {testimonial.location}
        </p>
      </div>
    </motion.div>
  );
}

export function VideoTestimonials() {
  return (
    <section id="video-testimonials" className="py-20 px-4 bg-[#F7FAFC]">
      <div className="max-w-5xl mx-auto">
        {/* SECTION HEADER */}
        <header className="text-center mb-14">
          <motion.h2
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl md:text-5xl font-bold text-[#1A202C] mb-3"
          >
            Hear From Our Students Themselves
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="text-base md:text-lg text-[#718096]"
          >
            Real brothers. Real results.
          </motion.p>
          <motion.p
            initial={{ opacity: 1, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-sm text-[#A0AEC0] mt-2"
          >
            Figures & dates are rough/approximated.
          </motion.p>
        </header>

        {/* VIDEO GRID - 2 per row like remoterizq */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 md:gap-x-14 gap-y-14 md:gap-y-16"
        >
          {videoTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              eager={index < 2}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
