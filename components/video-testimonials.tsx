"use client";

import { motion } from "framer-motion";

import { AutoplayPreviewEmbed } from "@/components/ui/autoplay-preview-embed";
import {
  clipPoster,
  clipSrc,
  videoTestimonials,
  type VideoTestimonial,
} from "@/lib/testimonial-videos";

/** Local poster frames, warmed ahead of the scroll by PrefetchBelowFold. */
export const TESTIMONIAL_POSTERS: string[] = videoTestimonials.map((t) =>
  clipPoster(t.slug)
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
          clip={clipSrc(testimonial.slug)}
          poster={clipPoster(testimonial.slug)}
          youtubeId={testimonial.videoId}
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
