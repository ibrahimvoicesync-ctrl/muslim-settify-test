"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    id: 1,
    question: "What makes Muslim Settify different from free YouTube training?",
    answer:
      "Two things: our exclusive training and job board, and an active community. We curate hundreds of roles for our students and maintain a private community of 100+ members offering peer accountability, scheduled coaching calls, and networking opportunities. You're not learning alone from videos—you have structured accountability and direct guidance.",
  },
  {
    id: 2,
    question: "Do I need prior sales experience?",
    answer:
      "No. The program is designed for complete beginners and includes comprehensive training on all aspects of appointment setting. Many of our most consistent students started with zero sales background.",
  },
  {
    id: 3,
    question: "How much time do I need to dedicate daily?",
    answer:
      "We say that there must be a minimum of 4 hours per day.",
  },
  {
    id: 4,
    question: "What if my English isn't perfect?",
    answer:
      "Clear communication is important, but native-level fluency is not required. We provide scripts and templates, and many successful setters are non-native English speakers. However, a good level of conversational English is definitely required. Strong accents can negatively affect results.",
  },
  {
    id: 5,
    question: "Can I do this while working full-time?",
    answer:
      "Absolutely. Many students complete the training while employed full-time. However, we cannot guarantee success with your schedule, and you must be able to put in 4 hours per day.",
  },
  {
    id: 6,
    question: "How long until I start earning?",
    answer:
      "We've seen students land their first role within the first two weeks, and others within six weeks or more. Timelines still depend on consistency and results vary.",
  },
  {
    id: 7,
    question: "Do you help me find roles?",
    answer:
      "Yes. The program includes appointment-setting career support such as application preparation, interview preparation, and access to our exclusive training and job board featuring businesses actively seeking setters.",
  },
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-[900px] mx-auto">
        {/* SECTION HEADER */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-4xl font-bold text-[#1A202C] mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 1, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="text-lg text-[#718096]"
          >
            Everything you need to know about the program
          </motion.p>
        </div>

        {/* ACCORDION */}
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
          className="space-y-0"
        >
          {faqs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            return (
              <motion.div
                key={faq.id}
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
                className="border-b border-[#E2E8F0]"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-[#F7FAFC] transition-colors duration-200 text-left group"
                >
                  <h3 className="text-lg font-semibold text-[#1A202C] pr-8">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-6 h-6 text-[#718096] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 max-w-[800px]">
                        <p className="text-base text-[#718096] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}

