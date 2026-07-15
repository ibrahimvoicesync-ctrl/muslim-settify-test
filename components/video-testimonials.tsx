"use client";

import { Zap, Coins } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { LiteEmbed } from "@/components/ui/lite-embed";

export const LOOM_THUMBNAILS: Record<string, string> = {
  "9351ea53e9d84356ba84aa2994a900bf":
    "https://cdn.loom.com/sessions/thumbnails/9351ea53e9d84356ba84aa2994a900bf-9924fbb0b912d642.gif",
  e26817a50f144028ae2b78754dc2bc30:
    "https://cdn.loom.com/sessions/thumbnails/e26817a50f144028ae2b78754dc2bc30-c748d2a24d725b8e.gif",
  fb861b6aa49b4e57a63db9ccf7a9c679:
    "https://cdn.loom.com/sessions/thumbnails/fb861b6aa49b4e57a63db9ccf7a9c679-fb92d01f2b1e83f6.gif",
  "11c0981d645c478ebc2323cb01c8f308":
    "https://cdn.loom.com/sessions/thumbnails/11c0981d645c478ebc2323cb01c8f308-010afecad06a4fca.gif",
};

export const YOUTUBE_VIDEO_IDS: string[] = [
  "tE-AMxW_p7I",
  "IyNpQAUubUA",
  "FAbzaf_OO28",
  "KSwLMwW7S0E",
  "0yU5bezEcxc",
  "TcOt_UAkgOg",
  "NZDyGrQ_23U",
  "7k_d5hjxSqQ",
  "oh3-3msxrFk",
  "tA7hMFxIFKU",
];

type BaseTestimonial = {
  id: number;
  name: string;
  headline: string;
  subheading: string;
  timeline: string[];
  result: string;
  highlight: boolean;
  closing?: string;
};

type YoutubeTestimonial = BaseTestimonial & {
  videoType: "youtube";
  videoId: string;
};

type LoomTestimonial = BaseTestimonial & {
  videoType: "loom";
  videoId: string;
};

type MP4Testimonial = BaseTestimonial & {
  videoType: "mp4";
  videoFile: string;
};

type VideoTestimonial = YoutubeTestimonial | LoomTestimonial | MP4Testimonial;

const videoTestimonials: VideoTestimonial[] = [
  {
    id: 1,
    name: "Aqib",
    headline: "Here Is Aqib Who Made $60k So Far From Setting And Closing",
    subheading: "Forget about $10k… Aqib's done $60k(not totally cash collected) in earnings last time I checked",
    videoType: "youtube" as const,
    videoId: "tE-AMxW_p7I",
    timeline: [
      "Feb 15 → Aqib got kicked out of his job recently",
      "Feb 18 → Aqib met Jamil & purchased his coaching",
      "April 15 → Aqib has made 4 figures in earnings",
      "May 31 → Aqib got accepted into his biggest job yet",
      "May 31 → Aqib did $12,000 in earnings (not fully collected) in May from all his remote sales revenue streams",
      "June 14 → Aqib has done approximately $11,000 of sales for the new company he is working in remote sales for already",
      "June 15 → Aqib's total earnings from the high-ticket sales space are at $24,000 (not fully collected yet)",
      "June 20 → Aqib started working as a setter for Muslimpreneur",
      "June 30 → Aqib has made around $30k (not fully collected)",
      "July 15 → Aqib made around $35k (not fully collected)",
      "July 20 → Hired as a closer for Buildfast",
      "September → Closed multiple deals for Buildfast",
      "November 1 → By this point has hit his first $14k+ month for his business.",
    ],
    result: "$60k+ total earnings • $14k+ best month",
    highlight: false,
  },
  {
    id: 2,
    name: "Melih",
    headline: "Melih's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "IyNpQAUubUA",
    timeline: [
      "May → Sold belongings to get into paid community",
      "May 10 → Joined our paid community",
      "May 31 → Landed his first role, which is a big role for a muslim influencer with around 300k followers on instagram",
      "June 30 → Earned approx $1250 in commissions",
      "End of July → Landed a huge role for another Muslim influencer who drives a Porsche in the UAE; this role had $2-3k on-target earnings monthly",
      "July 31 → Landed a new role with another Muslim influencer where the OTE is $2k-$5k per month. Now balancing two big roles",
      "August 11 → Made $1000 in the last 10 days then dropped out of university and is on track to earn more than his parents this month",
      "September → Received paychecks in the thousands from both his offers",
      "October → Traveled while working freely to Turkey and met Jamil in the UAE",
      "October → Has $3-4K OTE",
    ],
    result: "$3k-$4k OTE + traveling freely",
    highlight: false,
  },
  {
    id: 3,
    name: "Mohamad Hussein",
    headline: "Mohamad Hussein's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "cjDPLAlrLIM",
    timeline: [
      "April 29 → Joined our paid community to gain financial freedom",
      "April 30 → Finished all the material in like 12 hours and landed his first role after 1 day",
      "May 6 → Got a new role and started to book multiple meetings",
      "May → Throughout May he made some different commissions",
      "May 22 → Landing at $1000 in just around 3 weeks",
      "May 24 → Started working on a new role as an outbound setter for an agency",
      "June 14 → Working hard and happy with his role and position. Looking to receive many commissions soon",
      "July 15 → Made around $1.7k throughout his journey",
      "July 19 → Made almost $2.1k on his offer where he now works as an executive assistant",
      "August 1 → Made almost $3.5k in total",
      "September → Gets paid a base salary and a commission on a $3k OTE role",
      "October → OTE is around $7k-$8k and is a closer",
    ],
    result: "COO earning $7-8k OTE",
    highlight: false,
  },
  {
    id: 4,
    name: "Aeman Teter",
    headline: "Aeman Teter's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "KSwLMwW7S0E",
    timeline: [
      "June 14 → Joined the paid community, having worked with a couple of offers before joining",
      "July 1 → Made $1000+ on the offer he is on",
      "July 14 → Landed a role with an agency that makes $350k per month. The OTE is $2k-$8k per month",
      "August 3 → $11k in deals closed from Aeman's sets, and he made around $550 in one day",
      "August 22 → Made hijrah to Madinah",
      "End of August → Hired as a coach for a different offer",
      "September → Collected his first paycheck from his new offer",
      "September 6 → About to settle in an apartment in Madinah soon, in shaa Allah",
    ],
    result: "Landed $2k-$8k OTE working remotely",
    highlight: false,
  },
  {
    id: 8,
    name: "Muntasir",
    headline: "Muntasir's Story",
    subheading: "Imagine learning a craft one day, then two days later, you make $700.",
    videoType: "loom" as const,
    videoId: "9351ea53e9d84356ba84aa2994a900bf",
    timeline: [
      "Start of May → Muntasir has been in a programming course for months...",
      "May 10 → Around this point, he booked a call with me and watched our free training on appointment setting",
      "May 12 → We had our call, and he expressed his desire to make money fast, and liked appointment setting/DM work due to it being easy and fast cash",
      "May 14 → He collects a $700 payment from a coach via stripe for DM work",
    ],
    result: "$700 in just 3 days total",
    highlight: true,
  },
  {
    id: 5,
    name: "Hosaam",
    headline: "Hosaam's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "0yU5bezEcxc",
    timeline: [
      "Mid August → After being unemployed for the first time in six years, joined the program around August 19",
      "Around a month later → Landed his first appointment-setting job",
      "Shortly after → Received three job offers after onboarding",
      "About 37 days after landing his role → Earned roughly $2k+ while balancing full-time work",
      "End of October → Working two appointment-setting roles",
    ],
    result: "Two setting roles • ~$2k+ earned in about 37 days",
    highlight: false,
  },
  {
    id: 6,
    name: "Muhammad Afdhal",
    headline: "Muhammad Afdhal's Story",
    subheading: "",
    videoType: "loom" as const,
    videoId: "e26817a50f144028ae2b78754dc2bc30",
    timeline: [
      "April 20 → Joined our paid community",
      "April 26 → Got into his first role",
      "April 30 → Learning and getting better as a setter",
      "May 31 → Made approx $1.8k working in his role",
      "June 4 → Getting better at setting (through coaching)",
      "June 28 → Generated around $3k in total as an appointment setter",
      "July 29 → Made almost $4k in total",
      "September 14 → Making good money while doing the things he likes",
    ],
    result: "$6.8k Total Earned",
    highlight: false,
  },
  {
    id: 7,
    name: "Abid ur Rahman",
    headline: "Abid ur Rahman's Story",
    subheading: "",
    videoType: "loom" as const,
    videoId: "fb861b6aa49b4e57a63db9ccf7a9c679",
    timeline: [
      "May 25 → Joined our paid community",
      "May 31 → Landed his first role, which is a big role for a muslim influencer",
      "May → Really happy for his new role",
      "June 4 → Generated just under $1000 in commission for himself on the role",
      "July 14 → Landed a role with an agency owner with 76k followers on Instagram and 1.8k members on Skool and now gets a four-figure base salary plus commission",
    ],
    result: "Landed salary + commission",
    highlight: false,
  },
  {
    id: 9,
    name: "Shehab",
    headline: "Shehab's Story",
    subheading: "",
    videoType: "loom" as const,
    videoId: "11c0981d645c478ebc2323cb01c8f308",
    timeline: [
      "March 30 → Never worked in high ticket sales. Lives in Bangladesh.",
      "March 31 → Decided to invest in my paid programme, after knowing about my stuff for a while",
      "April 1 → Around this point he started training using the content and attending the live calls",
      "April 15 → Around this point, he was placed in a role (I help paid community members get Skool appointment setting roles)",
      "May 2 → Until this point, he made $1400 approx in earnings from the role",
      "May 3 → Around this point, he started working for Ustadh Abdul Aziz al Haggan's academy (he has 300k on Insta) as an appointment setter & closer",
      "May 13 → He's settling into the new role well and has set/closed 10 deals for the academy",
      "June 15 → Made $2k+",
    ],
    closing: "He's in bangladesh, and had 0 high ticket sales experience. If he can do it, why can't you?",
    result: "$2.1k+ from Bangladesh",
    highlight: false,
  },
  {
    id: 10,
    name: "Faizan",
    headline: "Faizan's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "TcOt_UAkgOg",
    timeline: [
      "Day 9 → Landed his first role",
      "Within month 1 → Landed 3 different roles",
      "Day 16 → Landed a role with base pay + commission",
      "→ Generated 5 figures in earnings",
    ],
    result: "5-figure earnings • 3 roles in month 1",
    highlight: false,
  },
  {
    id: 11,
    name: "Salman",
    headline: "Salman's Story",
    subheading: "From hotel security in East London to living in Madinah on a fully remote income.",
    videoType: "youtube" as const,
    videoId: "NZDyGrQ_23U",
    timeline: [
      "Before → Worked security at one of the biggest hotels in East London",
      "Before → Tried Amazon retail arbitrage",
      "→ Joined Muslim Settify and shifted into appointment setting",
      "→ Set a $7K deal, paid in full",
      "→ Worked multiple roles since",
      "→ Funded his hijrah on his last security shift",
      "Now → Living in Madinah on a fully remote income",
    ],
    result: "Funded hijrah • now living in Madinah",
    highlight: false,
  },
  {
    id: 12,
    name: "Muhammad Najath",
    headline: "Muhammad Najath's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "7k_d5hjxSqQ",
    timeline: [
      "End of December → Joined Muslim Settify",
      "→ Left his job in the UK",
      "→ Landed roles at 6-figure companies",
    ],
    result: "Landed roles at 6-figure companies",
    highlight: false,
  },
  {
    id: 13,
    name: "Jerry",
    headline: "Jerry's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "oh3-3msxrFk",
    timeline: [
      "7 months ago → Joined Muslim Settify",
      "→ Landed his first role at ~$3,000/month (base + commission)",
      "Months 1-4 → Made $11k",
      "Months 4-6 → Made $12k",
      "6 months in → $23,000 total earnings",
    ],
    result: "$23k total earnings in 6 months",
    highlight: false,
  },
  {
    id: 14,
    name: "Reece",
    headline: "Reece's Story",
    subheading: "",
    videoType: "youtube" as const,
    videoId: "tA7hMFxIFKU",
    timeline: [
      "→ Started with cold outbound for an AI offer",
      "→ Moved to inbound setting, then landed inbound setting at his current company",
      "→ Promoted to inbound closing",
      "→ Earns $250 commission per close",
      "→ Closed 7-8 deals in 2 weeks",
      "→ Generated $600+ in a single day",
    ],
    result: "$3k-$5k OTE • $600+ in a single day",
    highlight: false,
  },
];

export function VideoTestimonials() {
  return (
    <section id="video-testimonials" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-[#F7FAFC]">
      <div className="max-w-[1400px] mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4"
          >
            Hear From Our Students Themselves
          </motion.h2>
        <motion.p
          initial={{ opacity: 1, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
          className="text-sm sm:text-base text-[#A0AEC0]"
        >
          Figures & dates are rough/approximated.
        </motion.p>
        </div>

        {/* VIDEO GRID - 3 columns desktop, 2 tablet, 1 mobile */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {videoTestimonials.map((testimonial) => (
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
              className={cn(
                "bg-white rounded-2xl p-4 md:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 flex flex-col",
                testimonial.highlight
                  ? "border-2 border-[#00D4AA] lg:col-start-2"
                  : ""
              )}
            >
              {/* EARNINGS BADGE - ELEGANT SHIMMER */}
              <div className="mb-3 md:mb-4 h-10 md:h-14 flex items-center justify-center relative -mx-1 md:mx-0">
                <div
                  className="inline-flex items-center gap-1.5 md:gap-2.5 px-2.5 md:px-5 py-1.5 md:py-2 rounded-full font-semibold text-xs md:text-base border-2 relative overflow-hidden group bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-400 text-blue-900 w-[calc(100%-0.5rem)] md:w-auto max-w-full"
                >
                  {/* Shimmer animation */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"></div>
                  
                  {/* Animated coin */}
                  <motion.div
                    animate={{ 
                      rotate: [0, 15, -15, 0],
                      y: [0, -4, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="flex-shrink-0"
                  >
                    <Coins className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-600" />
                  </motion.div>
                  
                  <span className="relative z-10 font-bold text-center flex-1 min-w-0">{testimonial.result}</span>
                </div>
              </div>

              {/* VIDEO */}
              {testimonial.videoType === "youtube" && testimonial.videoId ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-3 md:mb-4">
                  <LiteEmbed
                    provider="youtube"
                    id={testimonial.videoId}
                    title={testimonial.headline}
                    className="w-full h-full"
                  />
                </div>
              ) : testimonial.videoType === "loom" && testimonial.videoId ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-3 md:mb-4">
                  <LiteEmbed
                    provider="loom"
                    id={testimonial.videoId}
                    thumbnailUrl={LOOM_THUMBNAILS[testimonial.videoId]}
                    title={testimonial.headline}
                    className="w-full h-full"
                  />
                </div>
              ) : testimonial.videoType === "mp4" && testimonial.videoFile ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-4 bg-black">
                  <video 
                    className="w-full h-full object-cover rounded-xl"
                    controls
                    preload="metadata"
                  >
                    <source src={`/videos/${testimonial.videoFile}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md mb-4 bg-gradient-to-br from-[#0066FF] to-[#0052CC] flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Video Coming Soon</p>
                </div>
              )}

              {/* TEXT CONTENT BELOW VIDEO */}
              <div className="flex-1 flex flex-col">
                {/* HEADER */}
                <div className="mb-3">
                  {testimonial.highlight && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00D4AA]/10 text-[#00D4AA] font-bold text-xs mb-2">
                      <Zap className="w-3 h-3" />
                      <span>FASTEST RESULT</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-[#1A202C] mb-1">
                    {testimonial.headline}
                  </h3>
                  {testimonial.subheading && (
                    <p className="text-sm text-[#718096] mb-2">{testimonial.subheading}</p>
                  )}
                </div>

                {/* TIMELINE */}
                <div className="space-y-2 mb-4 flex-1">
                  {testimonial.timeline.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-sm text-[#718096]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0066FF] flex-shrink-0 mt-2"></div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CLOSING LINE (for Shehab) */}
                {testimonial.closing && (
                  <p className="text-sm font-medium text-[#1A202C] mb-4 italic">
                    {testimonial.closing}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
