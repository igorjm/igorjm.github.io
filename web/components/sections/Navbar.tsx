"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ASSETS } from "@/lib/constants/assets";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { navSectionMap, useActiveSection } from "@/hooks/useActiveSection";
import { ActiveIndicator } from "@/components/ui/ActiveIndicator";
import { Icon } from "@/components/ui/Icon";
import { containerClassName, navLinkClassName } from "@/lib/constants/styles";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "about" as const, href: "#about" },
  { key: "tech" as const, href: "#tech" },
  { key: "timeline" as const, href: "#timeline" },
  { key: "work" as const, href: "#projects" },
  { key: "contact" as const, href: "#contact" },
];

function NavControls({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LanguageSwitcher />
      <ThemeToggle />
    </div>
  );
}

export function Navbar() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();
  const { scrollY } = useScroll();

  const navShadow = useTransform(
    scrollY,
    [0, 80],
    ["0 0 0 transparent", "0 8px 32px color-mix(in srgb, var(--color-background) 60%, transparent)"]
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      style={{ boxShadow: navShadow }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300",
        scrolled
          ? "border-section bg-surface/90"
          : "border-transparent bg-nav"
      )}
    >
      <div
        className={cn(
          containerClassName,
          "flex items-center justify-between py-4"
        )}
      >
        <a
          href="#hero"
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Image
            src={ASSETS.logo}
            alt=""
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          <span className="text-headline-sm font-extrabold tracking-tighter text-on-surface">
            {t("brand")}
          </span>
        </a>

        <ul className="hidden items-center gap-12 md:flex">
          {navItems.map((item) => {
            const isActive = activeSection === navSectionMap[item.key];
            return (
              <li key={item.key}>
                <a
                  href={item.href}
                  className={cn(
                    "text-label-mono relative transition-colors",
                    navLinkClassName(isActive)
                  )}
                >
                  {t(item.key)}
                  {isActive && (
                    <ActiveIndicator
                      layoutId="nav-indicator"
                      className="-bottom-1.5 left-0 w-full"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <NavControls className="hidden md:flex" />

        <button
          type="button"
          className="rounded p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? t("menu_close") : t("menu_open")}
        >
          <Icon>
            <path d={open ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
          </Icon>
        </button>
      </div>

      {open && (
        <div className="border-t border-section px-gutter py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  className={cn("text-label-mono", navLinkClassName(false))}
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
          <NavControls className="mt-4" />
        </div>
      )}
    </motion.nav>
  );
}
