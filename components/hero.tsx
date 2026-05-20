"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import {
  fadeIn,
  rise,
  zoomIn,
  reduced,
} from "@/components/ui/motion-presets";
import { AnimatedButton } from "@/components/ui/animated-button";
import { LiteEmbed } from "@/components/ui/lite-embed";

const HERO_LOOM_THUMBNAIL_URL =
  "https://cdn.loom.com/sessions/thumbnails/b62017a7639543548f22b1b3e5f7392e-8968465559e11e72.gif";

export function Hero() {
  const prefersReduced = useReducedMotion();
  const H = prefersReduced ? reduced : rise;
  const P = prefersReduced ? reduced : fadeIn;
  const Card = prefersReduced ? reduced : zoomIn;
  const Badge = prefersReduced ? reduced : fadeIn;

  return (
    <>
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 4s ease infinite;
        }
      `}</style>
      <section className="min-h-[85vh] md:min-h-[90vh] flex items-center py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto w-full">
          {/* CENTERED HEADLINE */}
          <motion.div
            variants={H}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="text-center mb-6 md:mb-8"
          >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#1A202C] leading-tight md:leading-[1.2] mb-4 md:mb-6 max-w-4xl mx-auto">
            <span className="block">Learn Appointment Setting &</span>
            <span className="block whitespace-normal sm:whitespace-nowrap">
              Earn Up To{" "}
              <span className="bg-gradient-to-r from-[#0066FF] via-purple-600 to-[#00D4AA] bg-clip-text text-transparent font-extrabold animate-gradient whitespace-nowrap">
                $2-6k Per Month
              </span>
            </span>
            <span className="block">Remotely</span>
          </h1>
            <motion.p
              variants={P}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.25 }}
              className="text-lg sm:text-xl text-[#718096] leading-relaxed max-w-3xl mx-auto"
            >
              High Ticket Sales reps can make upto even $50k p/m remotely. Watch this <span className="whitespace-nowrap">6-minute</span> video to see how it works.
            </motion.p>
          </motion.div>

          {/* HUGE VIDEO - MAIN FOCAL POINT */}
          <motion.div
            variants={Card}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mb-8 md:mb-12"
          >
            <div className="relative">
              {/* Video badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-[#0066FF] text-white text-xs font-bold uppercase px-4 py-1.5 rounded-full shadow-lg">
                  ▶ WATCH THIS FIRST
                </div>
              </div>

              {/* Video container */}
              <div className="relative w-full max-w-6xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-[#E2E8F0]">
                <LiteEmbed
                  provider="loom"
                  id="b62017a7639543548f22b1b3e5f7392e"
                  thumbnailUrl={HERO_LOOM_THUMBNAIL_URL}
                  title="What is Appointment Setting"
                  className="w-full h-full"
                  loading="eager"
                />
              </div>

              {/* Video caption */}
              <p className="text-center text-sm text-[#718096] mt-4">
                What is Appointment Setting & How You Earn Money (6 min)
              </p>
            </div>
          </motion.div>

          {/* CTA BUTTONS */}
          <motion.div
            variants={Badge}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <AnimatedButton
              href="/apply"
              className="w-full sm:w-auto text-sm md:text-lg"
            >
              Apply Now
            </AnimatedButton>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-[#E2E8F0] hover:border-[#0066FF] hover:text-[#0066FF] text-[#1A202C] font-bold text-sm md:text-lg px-6 md:px-12 py-3 md:py-6 rounded-xl bg-white transition-all duration-200 w-full sm:w-auto"
              onClick={() => {
                const element = document.querySelector("#combined-overview");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              Learn More ↓
            </Button>
          </motion.div>

          {/* TRUST BADGES */}
          <motion.div
            variants={Badge}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="flex flex-wrap gap-6 justify-center text-sm text-[#718096]"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00D4AA] flex-shrink-0" />
              <span>Hundreds of roles available</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00D4AA] flex-shrink-0" />
              <span>Active private community 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00D4AA] flex-shrink-0" />
              <span>Values-first training and mentorship</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#00D4AA] flex-shrink-0" />
              <span>No experience required</span>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
