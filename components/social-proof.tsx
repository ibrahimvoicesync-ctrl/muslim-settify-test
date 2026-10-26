"use client";

import { TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Aqib",
    initials: "AQ",
    color: "from-[#0066FF] to-[#0052CC]",
    summary: "Setter to closer to owning his own offer.",
    earnings: "$200k offer owner",
    highlight: false,
  },
  {
    id: 2,
    name: "Melih",
    initials: "ME",
    color: "from-[#00D4AA] to-[#00B894]",
    summary: "Setter to closer to offer manager.",
    earnings: "$5k+ per month",
    highlight: false,
  },
  {
    id: 3,
    name: "Mohammad Hussein",
    initials: "MH",
    color: "from-[#0066FF] to-[#0052CC]",
    summary: "Setter to closer to sales manager.",
    earnings: "$500k+ generated for his company",
    highlight: false,
  },
  {
    id: 4,
    name: "Aeman",
    initials: "AE",
    color: "from-[#00D4AA] to-[#00B894]",
    summary: "Landed a remote setter role and relocated from Canada to KSA.",
    earnings: "$2k-$5k OTE",
    highlight: false,
  },
  {
    id: 5,
    name: "Hosaam",
    initials: "HO",
    color: "from-[#0066FF] to-[#0052CC]",
    summary: "Balanced two setter roles at the same time.",
    earnings: "Thousands of dollars made",
    highlight: false,
  },
  {
    id: 6,
    name: "Muhammad Afdhal",
    initials: "MA",
    color: "from-[#00D4AA] to-[#00B894]",
    summary: "Got into appointment setting from Qatar.",
    earnings: "$5k+ made",
    highlight: false,
  },
  {
    id: 7,
    name: "Shehab",
    initials: "SH",
    color: "from-[#0066FF] to-[#0052CC]",
    summary: "Got into appointment setting from Bangladesh.",
    earnings: "Making money remotely",
    highlight: false,
  },
  {
    id: 8,
    name: "Abu Umar",
    initials: "AU",
    color: "from-[#00D4AA] to-[#00B894]",
    summary: "Got into appointment setting from Bangladesh.",
    earnings: "$6k+ per month",
    highlight: false,
  },
  {
    id: 9,
    name: "Abdul Rahman",
    initials: "AR",
    color: "from-[#0066FF] to-[#0052CC]",
    summary: "Went straight into closing — rare for a beginner.",
    earnings: "$3k in ~2 months",
    highlight: false,
  },
];

export function SocialProof() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4"
          >
            Real Students, Real Results
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-lg text-[#718096]"
          >
            Join 100+ students building sustainable income
          </motion.p>
        </div>

        {/* TESTIMONIALS GRID - 3 columns desktop, 2 tablet, 1 mobile */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 1 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
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
              className={`bg-white rounded-xl p-3 md:p-4 lg:p-5 border border-[#E2E8F0] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${
                testimonial.highlight ? "border-2 border-[#00D4AA]" : ""
              }`}
            >
              {/* Profile */}
              <div className="flex items-start gap-2 md:gap-3 lg:gap-4 mb-2 md:mb-3 lg:mb-4">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white font-bold text-xs md:text-sm lg:text-lg flex-shrink-0`}
                >
                  {testimonial.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                    <div className="font-bold text-xs md:text-sm lg:text-base text-[#1A202C] truncate">
                      {testimonial.name}
                    </div>
                    {testimonial.highlight && (
                      <div className="inline-flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-0.5 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] font-bold text-[10px] md:text-xs">
                        <Zap className="w-2 h-2 md:w-3 md:h-3" />
                        <span>FASTEST</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-xs md:text-sm lg:text-base text-[#2D3748] leading-tight md:leading-relaxed mb-2 md:mb-3 lg:mb-4 flex-1">
                {testimonial.summary}
              </p>

              {/* Result Badge */}
              <div
                className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-full font-semibold text-[10px] md:text-xs lg:text-sm mt-auto ${
                  testimonial.highlight
                    ? "bg-[#00D4AA] text-white"
                    : "bg-[#E6FFFA] text-[#00D4AA]"
                }`}
              >
                <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3 lg:h-3.5 lg:w-3.5" />
                <span className="truncate">💰 {testimonial.earnings}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
