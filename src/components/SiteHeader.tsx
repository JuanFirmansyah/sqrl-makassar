import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Globe, Menu, X } from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */
export type Language = "en" | "id";
export type HeaderVariant = "landing" | "events";

/* ============================================================
   NAV — single source of truth
   ============================================================ */
const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "events", href: "/events" },
  { key: "clubs", href: "/events#clubs" },
  { key: "news", href: "/news" },
  { key: "contact", href: "/contact" },
] as const;

type NavKey = (typeof NAV_ITEMS)[number]["key"];

const NAV_LABELS: Record<Language, Record<NavKey, string>> = {
  en: {
    home: "Home",
    events: "Events",
    clubs: "Clubs",
    news: "News",
    contact: "Contact",
  },
  id: {
    home: "Home",
    events: "Event",
    clubs: "Klub",
    news: "Berita",
    contact: "Kontak",
  },
};

/* ============================================================
   EXTERNAL LINKS — dipakai untuk CTA
   ============================================================ */
const GOOGLE_FORM = "https://forms.gle/REPLACE_WITH_YOUR_FORM_ID";

/* ============================================================
   HELPERS
   ============================================================ */
function isActive(itemHref: string, currentPath: string): boolean {
  const [itemPath] = itemHref.split("#");

  // Home hanya aktif di root
  if (itemPath === "/") return currentPath === "/";

  // Item yang punya hash (mis. /events#clubs) → aktif hanya kalau path cocok
  // (hash tidak dipakai untuk highlighting karena sulit di-track tanpa router)
  return currentPath.startsWith(itemPath);
}

/* ============================================================
   COMPONENT
   ============================================================ */
export default function SiteHeader({
  lang,
  setLang,
  currentPath,
  variant = "landing",
}: {
  lang: Language;
  setLang: (l: Language) => void;
  currentPath: string;
  variant?: HeaderVariant;
  googleFormUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  // Lock body scroll saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // CTA berbeda per variant
  const cta =
    variant === "landing"
      ? {
          href: GOOGLE_FORM,
          label: lang === "en" ? "Register Now" : "Daftar Sekarang",
          external: true,
        }
      : {
          href: "/login",
          label: lang === "en" ? "Login" : "Masuk",
          external: false,
        };

  return (
    <>
      {/* ============================================================
          STICKY HEADER
          ============================================================ */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#06070B]/70 border-b border-white/5">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 h-16 lg:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="SQRL Home">
            <span className="font-display italic text-3xl lg:text-4xl tracking-tight leading-none">
              SQRL
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href, currentPath);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`relative text-[13px] font-semibold tracking-[0.15em] uppercase transition-colors ${
                    active ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {NAV_LABELS[lang][item.key]}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-2 h-[2px] bg-[#3B82F6] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Lang toggle + CTA + Mobile menu button */}
          <div className="flex items-center gap-3">
            {/* Language pill */}
            <div className="hidden sm:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              {(["en", "id"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-label={`Switch to ${l.toUpperCase()}`}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition ${
                    lang === l
                      ? "bg-white text-black"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {/* CTA */}
            {cta.external ? (
              <a
                href={cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-2 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[12px] tracking-widest uppercase px-5 py-2.5 transition shadow-lg shadow-blue-600/20"
              >
                {cta.label}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href={cta.href}
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-[12px] tracking-widest uppercase px-5 py-2.5 transition shadow-lg shadow-blue-600/20"
              >
                {cta.label}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden w-10 h-10 grid place-items-center rounded-md border border-white/10 hover:bg-white/5 transition"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE OVERLAY
          ============================================================ */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            className="fixed inset-0 z-[100] bg-[#06070B] overflow-y-auto"
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
              <span className="font-display italic text-3xl">SQRL</span>
              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 grid place-items-center rounded-md border border-white/10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-5 pt-6 gap-1" aria-label="Mobile">
              {NAV_ITEMS.map((item, i) => {
                const active = isActive(item.href, currentPath);
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : i * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block py-4 border-b border-white/5 font-display text-5xl italic tracking-tight ${
                        active ? "text-[#3B82F6]" : "text-white/80"
                      }`}
                    >
                      {NAV_LABELS[lang][item.key]}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            {/* Lang + CTA */}
            <div className="px-5 mt-6 flex flex-col gap-3 pb-10">
              <div className="grid grid-cols-2 gap-3">
                {(["en", "id"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`py-4 rounded-xl border flex items-center justify-center gap-2 font-bold tracking-widest text-sm uppercase transition ${
                      lang === l
                        ? "bg-white text-black border-white"
                        : "border-white/15 text-white/70"
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    {l === "en" ? "English" : "Indonesia"}
                  </button>
                ))}
              </div>

              {cta.external ? (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="w-full py-4 rounded-xl bg-[#2563EB] text-center font-bold tracking-widest text-sm uppercase"
                >
                  {cta.label}
                </a>
              ) : (
                <Link
                  href={cta.href}
                  onClick={() => setOpen(false)}
                  className="w-full py-4 rounded-xl bg-[#2563EB] text-center font-bold tracking-widest text-sm uppercase"
                >
                  {cta.label}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}