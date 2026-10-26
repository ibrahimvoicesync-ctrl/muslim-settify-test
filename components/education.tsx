"use client";

import { motion } from "framer-motion";
import { LiteEmbed } from "@/components/ui/lite-embed";

import { HERO_VIDEO_ID, HERO_VIDEO_LOOM_THUMBNAIL } from "@/lib/hero-video";

export function Education() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[900px] mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-semibold text-[#0066FF] uppercase tracking-[1px] mb-4"
          >
            New to Appointment Setting?
          </motion.p>

          <motion.h2
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4"
          >
            What is Appointment Setting?
          </motion.h2>

          <motion.p
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#718096] leading-relaxed max-w-[700px] mx-auto"
          >
            Watch this video to understand how appointment setters help businesses grow and earn $3k-$15k monthly doing it.
          </motion.p>
        </div>

        {/* SINGLE FEATURED VIDEO - LOOM EMBED */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <LiteEmbed
              provider="loom"
              id={HERO_VIDEO_ID}
              thumbnailUrl={HERO_VIDEO_LOOM_THUMBNAIL}
              title="What is Appointment Setting"
              className="w-full h-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
