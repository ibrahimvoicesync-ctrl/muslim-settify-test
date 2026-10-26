"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatedButton } from "@/components/ui/animated-button";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Smooth-scroll only when the target section is already on this page.
    if (pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const element = document.querySelector(href.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 w-full bg-white border-b border-[#E2E8F0] z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : ""
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-3 items-center h-16 md:h-[72px]">
          {/* Logo */}
          <div className="flex justify-start">
            <Link
              href="/"
              aria-label="Go to home"
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
              onClick={() => {
                setMobileMenuOpen(false);
              }}
            >
              <Image
                src="/settify-bg.png"
                alt="Muslim Settify"
                width={36}
                height={36}
                priority
                fetchPriority="high"
                unoptimized
                sizes="(max-width: 768px) 28px, 36px"
                className="h-7 w-7 md:h-9 md:w-9 select-none pointer-events-none"
              />
              <span className="hidden md:inline text-lg font-bold tracking-tight text-[#1A202C]">
                Muslim Settify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center space-x-6 xl:space-x-8">
            <Link
              href="/#combined-overview"
              onClick={(e) => handleLinkClick(e, "/#combined-overview")}
              className="text-sm xl:text-base font-medium text-[#718096] hover:text-[#0066FF] transition-colors duration-200 whitespace-nowrap"
            >
              Program
            </Link>
            <Link
              href="/#video-testimonials"
              onClick={(e) => handleLinkClick(e, "/#video-testimonials")}
              className="text-sm xl:text-base font-medium text-[#718096] hover:text-[#0066FF] transition-colors duration-200 whitespace-nowrap"
            >
              Success Stories
            </Link>
            <Link
              href="/#faq"
              onClick={(e) => handleLinkClick(e, "/#faq")}
              className="text-sm xl:text-base font-medium text-[#718096] hover:text-[#0066FF] transition-colors duration-200 whitespace-nowrap"
            >
              FAQ
            </Link>
            <Link
              href="/more-success"
              onClick={(e) => handleLinkClick(e, "/more-success")}
              className="text-sm xl:text-base font-medium text-[#718096] hover:text-[#0066FF] transition-colors duration-200 whitespace-nowrap"
            >
              More Success
            </Link>
          </nav>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex justify-end">
            <AnimatedButton
              href="/apply"
              className="px-5 xl:px-6 py-2 xl:py-2.5 text-sm xl:text-base"
            >
              Apply Now
            </AnimatedButton>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden col-span-2 flex justify-end">
            <button
              className="p-2 text-[#718096] hover:text-[#1A202C] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Slide in from right. Hidden when closed, not just
          parked off-screen: a closed drawer must stay out of the tab order and
          out of a screen reader's way. */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen
            ? "translate-x-0 visible"
            : "translate-x-full invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col h-full p-8">
          {/* Close button */}
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#718096] hover:text-[#1A202C] transition-colors"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Mobile Links */}
          <div className="flex flex-col space-y-6">
            <Link
              href="/#combined-overview"
              onClick={(e) => handleLinkClick(e, "/#combined-overview")}
              className="text-lg font-medium text-[#1A202C] hover:text-[#0066FF] transition-colors"
            >
              Program
            </Link>
            <Link
              href="/#video-testimonials"
              onClick={(e) => handleLinkClick(e, "/#video-testimonials")}
              className="text-lg font-medium text-[#1A202C] hover:text-[#0066FF] transition-colors"
            >
              Success Stories
            </Link>
            <Link
              href="/#faq"
              onClick={(e) => handleLinkClick(e, "/#faq")}
              className="text-lg font-medium text-[#1A202C] hover:text-[#0066FF] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/more-success"
              onClick={(e) => handleLinkClick(e, "/more-success")}
              className="text-lg font-medium text-[#1A202C] hover:text-[#0066FF] transition-colors"
            >
              More Success
            </Link>
            <div className="pt-4">
              <AnimatedButton
                href="/apply"
                className="w-full py-3 text-base"
              >
                Apply Now
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}

