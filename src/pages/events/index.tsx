import { createContext, useContext, useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, BookOpen, Calendar, MapPin,
  MessageCircle, Navigation, Plus, Sparkles,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

/* ============================================================
   INSTAGRAM ICON (lucide-react deprecated)
   ============================================================ */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/* ============================================================
   1. TYPES
   ============================================================ */
type Language = "en" | "id";
type EventStatus = "UPCOMING" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED";
type HubColor =
  | "blue" | "peach" | "green" | "purple" | "brown" | "cyan" | "pink" | "yellow";
type L10n = { en: string; id: string };

/* ============================================================
   2. DATA
   ============================================================ */
const EVENT = {
  name: "EIRC",
  year: 2026,
  startDate: "2026-10-09T07:30:00+08:00",
  endDate: "2026-10-11T18:00:00+08:00",
  registrationDeadline: "2026-10-02T23:59:59+08:00",
  registrationOpen: true,
  venue: { en: "Karebosi Field", id: "Lapangan Karebosi" } as L10n,
  city: { en: "Makassar, South Sulawesi", id: "Makassar, Sulawesi Selatan" } as L10n,
  organizer: "SQRL",
};

const LINKS = {
  instagram: "https://www.instagram.com/sqrl.makassar",
  whatsapp: "https://wa.me/6282345006270",
  googleForm: "https://docs.google.com/forms/d/e/1FAIpQLSfs3fwKDyzqL72JUJ-cXqKpDv31z71te8eHlBUOdIEcg7XL6g/viewform",
  liveRace: "/live-race",
  eCertificate: "/e-certificate",
  thbPdf: "/docs/eirc-2026-thb.pdf",
  athleteBookPdf: "/docs/eirc-2026-athlete-book.pdf",
  raceBookPdf: "/docs/eirc-2026-race-book.pdf",
  twibbon: "/twibbon",
  liveStream: "https://www.youtube.com/@sqrl.makassar",
  maps: "https://maps.google.com/?q=Lapangan+Karebosi+Makassar",
};

const EVENT_STATS = [
  { id: "clubs", value: "42", label: { en: "Registered Clubs", id: "Klub Terdaftar" } },
  { id: "athletes", value: "380+", label: { en: "Athletes", id: "Atlet" } },
  { id: "days", value: "3", label: { en: "Competition Days", id: "Hari Lomba" } },
  { id: "categories", value: "8+", label: { en: "Race Categories", id: "Kategori Lomba" } },
];

const EVENT_LINKS: Array<{
  id: string; eyebrow: L10n; title: L10n; description: L10n; cta: L10n;
  href: string; icon: string; color: HubColor; external?: boolean;
}> = [
  { id: "whatsapp", eyebrow: { en: "Contact", id: "Kontak" }, title: { en: "Admin EIRC 2026", id: "Admin EIRC 2026" }, description: { en: "Chat with our race admin for anything you need.", id: "Hubungi admin untuk pertanyaan seputar lomba." }, cta: { en: "Chat on WhatsApp", id: "Chat WhatsApp" }, href: LINKS.whatsapp, icon: "MessageCircle", color: "blue", external: true },
  { id: "register", eyebrow: { en: "Registration", id: "Pendaftaran" }, title: { en: "Register", id: "Pendaftaran" }, description: { en: "Sign up through our official Google Form.", id: "Daftar via Google Form resmi kami." }, cta: { en: "Open Form", id: "Buka Form" }, href: LINKS.googleForm, icon: "Sparkles", color: "peach", external: true },
  { id: "thb", eyebrow: { en: "Handbook", id: "Panduan" }, title: { en: "THB", id: "THB" }, description: { en: "Regulations, schedule and technical race requirements.", id: "Peraturan, jadwal, dan ketentuan teknis lomba." }, cta: { en: "Read Now", id: "Baca Sekarang" }, href: LINKS.thbPdf, icon: "BookOpen", color: "green", external: true },
  { id: "twibbon", eyebrow: { en: "Social", id: "Sosial" }, title: { en: "Twibbon", id: "Twibbon" }, description: { en: "Frame your race photos and support your club.", id: "Bingkai fotomu dan dukung klubmu." }, cta: { en: "Get Twibbon", id: "Ambil Twibbon" }, href: LINKS.twibbon, icon: "Sparkles", color: "pink" },
];

const FAQ_ITEMS = [
  { id: "where", q: { en: "Where is EIRC 2026 held?", id: "Di mana EIRC 2026 diadakan?" }, a: { en: "Karebosi Field, Makassar, South Sulawesi.", id: "Lapangan Karebosi, Makassar, Sulawesi Selatan." } },
  { id: "when", q: { en: "When is the competition?", id: "Kapan lombanya?" }, a: { en: "9 – 11 October 2026, starting at 07:30 each day (WITA).", id: "9 – 11 Oktober 2026, mulai pukul 07:30 setiap hari (WITA)." } },
  { id: "how", q: { en: "How do I register?", id: "Bagaimana cara mendaftar?" }, a: { en: "Fill out the official Google Form — the link is available on this page.", id: "Isi Google Form resmi — link tersedia di halaman ini." } },
  { id: "schedule", q: { en: "Where can I see the race schedule?", id: "Di mana saya bisa lihat jadwal lomba?" }, a: { en: "Check the Race Weekend section above or download the Race Book.", id: "Cek bagian Race Weekend di atas atau unduh Race Book." } },
  { id: "clubs", q: { en: "Where can I see the registered clubs?", id: "Di mana saya bisa lihat klub terdaftar?" }, a: { en: "Scroll to The Starting Line section — you can search and filter clubs there.", id: "Scroll ke bagian The Starting Line — kamu bisa cari dan filter klub di sana." } },
  { id: "athlete", q: { en: "Where can I get the Athlete Book?", id: "Di mana saya bisa dapat Athlete Book?" }, a: { en: "Download it from the Official Event Documents section.", id: "Unduh dari bagian Official Event Documents." } },
  { id: "race", q: { en: "Where can I get the Race Book?", id: "Di mana saya bisa dapat Race Book?" }, a: { en: "Download it from the Official Event Documents section.", id: "Unduh dari bagian Official Event Documents." } },
  { id: "admin", q: { en: "Where can I contact the event admin?", id: "Di mana saya bisa hubungi admin event?" }, a: { en: "Chat the admin directly via the WhatsApp card in the hub section.", id: "Chat admin langsung lewat kartu WhatsApp di hub section." } },
];

/* ============================================================
   3. I18N DICTIONARY
   ============================================================ */
type Dict = {
  login: string;
  hero: {
    eyebrow: string; tagline: string;
    ctaPrimary: string; ctaSecondary: string; ctaRegister: string; ctaClosed: string;
  };
  hub: { heading: string; sub: string; hint: string };
  social: { heading: string; igCta: string; twibbonCta: string };
  location: { heading: string; cta: string };
  faq: { heading: string; sub: string };
  footer: {
    tagline: string; home: string; events: string; results: string;
    contact: string; privacy: string; terms: string; copyright: string; social: string;
  };
};

const DICT: Record<Language, Dict> = {
  en: {
    login: "Login",
    hero: {
      eyebrow: "SQRL Presents",
      tagline: "Three days. One arena. Makassar becomes the fastest city in the east.",
      ctaPrimary: "View Event Details",
      ctaSecondary: "Registered Clubs",
      ctaRegister: "Register Now",
      ctaClosed: "Registration Closed",
    },
    hub: { heading: "Everything You Need", sub: "For race day", hint: "Quick access & data" },
    social: { heading: "Follow The Action", igCta: "Follow on Instagram", twibbonCta: "Get Twibbon" },
    location: { heading: "See You At The Track", cta: "Open in Google Maps" },
    faq: { heading: "Frequently Asked", sub: "Quick answers." },
    footer: {
      tagline: "Precision on wheels. Pride from Makassar.",
      home: "Home", events: "Events", results: "Results", contact: "Contact",
      privacy: "Privacy", terms: "Terms",
      copyright: "© 2026 SQRL. ALL RIGHTS RESERVED.",
      social: "Instagram",
    },
  },
  id: {
    login: "Masuk",
    hero: {
      eyebrow: "SQRL Mempersembahkan",
      tagline: "Tiga hari. Satu arena. Makassar jadi kota tercepat di timur.",
      ctaPrimary: "Lihat Detail Event",
      ctaSecondary: "Klub Terdaftar",
      ctaRegister: "Daftar Sekarang",
      ctaClosed: "Pendaftaran Ditutup",
    },
    hub: { heading: "Semua yang Kamu Butuhkan", sub: "Untuk race day", hint: "Akses cepat & data" },
    social: { heading: "Ikuti Keseruannya", igCta: "Follow di Instagram", twibbonCta: "Ambil Twibbon" },
    location: { heading: "Sampai Jumpa di Arena", cta: "Buka di Google Maps" },
    faq: { heading: "Pertanyaan Umum", sub: "Jawaban cepat." },
    footer: {
      tagline: "Presisi di atas roda. Kebanggaan dari Makassar.",
      home: "Home", events: "Event", results: "Hasil", contact: "Kontak",
      privacy: "Privasi", terms: "Ketentuan",
      copyright: "© 2026 SQRL. HAK CIPTA DILINDUNGI.",
      social: "Instagram",
    },
  },
};

/* ============================================================
   4. LANGUAGE CONTEXT
   ============================================================ */
const LangCtx = createContext<{
  lang: Language; setLang: (l: Language) => void; t: Dict;
} | null>(null);

function useLang() {
  const c = useContext(LangCtx);
  if (!c) throw new Error("LangCtx missing");
  return c;
}

/* ============================================================
   5. HELPERS
   ============================================================ */
function getEventStatus(now: Date = new Date()): EventStatus {
  const s = new Date(EVENT.startDate).getTime();
  const e = new Date(EVENT.endDate).getTime();
  const d = new Date(EVENT.registrationDeadline).getTime();
  const t = now.getTime();
  if (t >= s && t <= e) return "LIVE";
  if (t > e) return "COMPLETED";
  if (t >= d || !EVENT.registrationOpen) return "REGISTRATION_CLOSED";
  return "UPCOMING";
}

const ICONS: Record<string, React.ElementType> = {
  MessageCircle, BookOpen, Sparkles,
};

/* ============================================================
   6. HERO — pakai logo image EIRC
   ============================================================ */
function Hero() {
  const { lang, t } = useLang();
  const reduce = useReducedMotion();
  const status = getEventStatus();
  const showRegister = status === "UPCOMING" && EVENT.registrationOpen;

  const fade = (d = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: reduce ? 0 : d },
  });

  return (
    <section className="relative overflow-hidden border-b border-white/5 pt-16 lg:pt-20">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#2563EB]/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-[#F97316]/10 blur-[140px]" />

      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center py-14 lg:py-24 relative">
        <div className="lg:col-span-7 relative z-10">
          <motion.p {...fade(0)} className="text-[11px] sm:text-[12px] font-bold tracking-[0.3em] uppercase text-[#A5B4FC] mb-6">
            {t.hero.eyebrow}
          </motion.p>

          <motion.div {...fade(0.1)} className="relative w-full max-w-[560px] lg:max-w-[640px]">
            <Image
              src="/images/eirc-logo.png"
              alt="EIRC 2026 — Eastern Indonesia Inline Race Championship"
              width={1280}
              height={640}
              priority
              sizes="(max-width: 1024px) 90vw, 640px"
              className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.35)]"
            />
          </motion.div>

          <motion.p {...fade(0.2)} className="mt-6 max-w-xl text-white/70 text-base lg:text-lg leading-relaxed">
            {t.hero.tagline}
          </motion.p>

          <motion.div {...fade(0.3)} className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <span className="inline-flex items-center gap-2 text-white/85 font-semibold tracking-wide">
              <Calendar className="w-4 h-4 text-[#FCD34D]" /> 09 — 11 OCTOBER 2026
            </span>
            <span className="inline-flex items-center gap-2 text-white/85 font-semibold tracking-wide">
              <MapPin className="w-4 h-4 text-[#67E8F9]" /> {EVENT.city[lang].toUpperCase()}
            </span>
          </motion.div>

          <motion.div {...fade(0.4)} className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="#hub"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition shadow-xl shadow-blue-600/30"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#social"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 hover:bg-white/5 px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition"
            >
              {t.hero.ctaSecondary}
            </Link>
            {showRegister && (
              <a
                href={LINKS.googleForm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition shadow-xl shadow-orange-500/25"
              >
                {t.hero.ctaRegister}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
            {!showRegister && status === "REGISTRATION_CLOSED" && (
              <span className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-6 py-4 font-bold tracking-widest text-[13px] uppercase text-white/50">
                {t.hero.ctaClosed}
              </span>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.15 }}
          className="lg:col-span-5 relative aspect-[4/5] lg:aspect-[3/4] rounded-[28px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#0F172A] via-[#0B0D14] to-[#111827]"
        >
          <Image
            src="/images/eirc-2026-artworkk.jpeg"
            alt="EIRC 2026 official artwork"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070B]/85 via-transparent to-transparent" />

          <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-3 py-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase">Official</span>
          </div>

          <div className="absolute bottom-5 left-5 right-5">
            <p className="font-display italic text-2xl lg:text-3xl leading-none">RACE WEEKEND</p>
            <p className="text-xs tracking-[0.25em] uppercase text-white/60 mt-1">Karebosi Field, Makassar</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   7. EVENT STATS
   ============================================================ */
function Stats() {
  const { lang } = useLang();
  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-white/5 lg:divide-x">
          {EVENT_STATS.map((s, i) => (
            <div key={s.id} className={`py-6 px-2 lg:px-8 ${i < 2 ? "border-b lg:border-b-0 border-white/5" : ""}`}>
              <p className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-none bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="mt-3 text-[11px] tracking-[0.25em] uppercase text-white/50">{s.label[lang]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. EVENT HUB
   ============================================================ */
const PALETTE: Record<HubColor, { bg: string; text: string; sub: string; eyebrow: string; badge: string; cta: string }> = {
  blue: { bg: "bg-[#A5B4FC]", text: "text-[#1E1B4B]", sub: "text-[#1E1B4B]/70", eyebrow: "text-[#1E1B4B]/60", badge: "bg-[#1E1B4B]/10 text-[#1E1B4B]", cta: "text-[#1E1B4B]" },
  peach: { bg: "bg-[#FDBA74]", text: "text-[#451A03]", sub: "text-[#451A03]/70", eyebrow: "text-[#451A03]/60", badge: "bg-[#451A03]/10 text-[#451A03]", cta: "text-[#451A03]" },
  green: { bg: "bg-[#0F3D2E]", text: "text-white", sub: "text-white/70", eyebrow: "text-[#6EE7B7]", badge: "bg-[#10B981]/20 text-[#6EE7B7]", cta: "text-[#6EE7B7]" },
  purple: { bg: "bg-[#2E1A47]", text: "text-white", sub: "text-white/70", eyebrow: "text-[#C4B5FD]", badge: "bg-[#8B5CF6]/25 text-[#C4B5FD]", cta: "text-[#C4B5FD]" },
  brown: { bg: "bg-[#3B2A0F]", text: "text-white", sub: "text-white/70", eyebrow: "text-[#FCD34D]", badge: "bg-[#F59E0B]/25 text-[#FCD34D]", cta: "text-[#FCD34D]" },
  cyan: { bg: "bg-[#0A2E38]", text: "text-white", sub: "text-white/70", eyebrow: "text-[#67E8F9]", badge: "bg-[#22D3EE]/25 text-[#67E8F9]", cta: "text-[#67E8F9]" },
  pink: { bg: "bg-[#F9A8D4]", text: "text-[#4C0519]", sub: "text-[#4C0519]/70", eyebrow: "text-[#4C0519]/60", badge: "bg-[#4C0519]/10 text-[#4C0519]", cta: "text-[#4C0519]" },
  yellow: { bg: "bg-[#FCD34D]", text: "text-[#422006]", sub: "text-[#422006]/70", eyebrow: "text-[#422006]/60", badge: "bg-[#422006]/10 text-[#422006]", cta: "text-[#422006]" },
};

function Hub() {
  const { lang, t } = useLang();
  return (
    <section id="hub" className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div>
            <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.hub.heading}</h2>
            <p className="mt-3 text-white/60 text-lg">{t.hub.sub}</p>
          </div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-white/40">
            {"// "}
            {t.hub.hint}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {EVENT_LINKS.map((link, i) => {
            const p = PALETTE[link.color];
            const Icon = ICONS[link.icon] ?? Sparkles;
            const Comp: React.ElementType = link.external ? "a" : Link;
            const extra = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.05 }}
              >
                <Comp
                  href={link.href}
                  {...extra}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl ${p.bg} ${p.text} p-6 sm:p-7 lg:p-8 min-h-[220px] lg:min-h-[260px] transition-transform duration-300 hover:-translate-y-1`}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
                    style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>\")" }}
                  />
                  <div className="flex items-start justify-between gap-4 relative">
                    <div className="flex-1">
                      <p className={`text-[10px] font-bold tracking-[0.3em] uppercase ${p.eyebrow} mb-3`}>{link.eyebrow[lang]}</p>
                      <h3 className="font-display italic text-3xl sm:text-4xl lg:text-[42px] leading-[0.95] max-w-md">{link.title[lang]}</h3>
                    </div>
                    <div className={`shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-2xl grid place-items-center ${p.badge} transition-transform duration-300 group-hover:rotate-6`}>
                      <Icon className="w-6 h-6 lg:w-7 lg:h-7" strokeWidth={2.2} />
                    </div>
                  </div>
                  <div className="relative mt-6 flex items-end justify-between gap-4">
                    <p className={`text-sm max-w-xs ${p.sub}`}>{link.description[lang]}</p>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.2em] uppercase ${p.cta} whitespace-nowrap`}>
                      {link.cta[lang]}
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Comp>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   9. SOCIAL / COMMUNITY
   ============================================================ */
function Social() {
  const { t } = useLang();
  return (
    <section id="social" className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9] mb-10">{t.social.heading}</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          <a
            href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#F97316]/20 via-[#EC4899]/15 to-transparent p-8 lg:p-10 min-h-[200px] flex flex-col justify-between transition hover:-translate-y-1"
          >
            <InstagramIcon className="w-10 h-10 text-[#FDBA74]" />
            <div>
              <p className="text-sm text-white/60 mb-1">{t.social.igCta}</p>
              <p className="font-display italic text-3xl leading-none">@sqrl.makassar</p>
            </div>
          </a>
          <a
            href={LINKS.twibbon}
            className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#F9A8D4]/20 via-[#C4B5FD]/15 to-transparent p-8 lg:p-10 min-h-[200px] flex flex-col justify-between transition hover:-translate-y-1"
          >
            <Sparkles className="w-10 h-10 text-[#F9A8D4]" />
            <div>
              <p className="text-sm text-white/60 mb-1">{t.social.twibbonCta}</p>
              <p className="font-display italic text-3xl leading-none">TWIBBON</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   10. LOCATION
   ============================================================ */
function Location() {
  const { t } = useLang();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.location.heading}</h2>
          <div className="mt-8 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#F97316]/20 text-[#FDBA74] grid place-items-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-lg">{EVENT.venue.id}</p>
              <p className="text-white/60 mt-1">{EVENT.city.id}</p>
            </div>
          </div>
          <a
            href={LINKS.maps} target="_blank" rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-xl border border-white/15 hover:bg-white/5 px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition"
          >
            <Navigation className="w-4 h-4" />
            {t.location.cta}
          </a>
        </div>
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-[#0B0D14]">
          <div
            className="absolute inset-0 opacity-30"
            style={{ backgroundImage: "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(249,115,22,0.25), transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px)" }}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-14 h-14 rounded-full bg-[#F97316] grid place-items-center shadow-2xl shadow-orange-500/50 animate-pulse">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   11. FAQ
   ============================================================ */
function FAQ() {
  const { lang, t } = useLang();
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 grid lg:grid-cols-[380px_1fr] gap-10 lg:gap-16">
        <div>
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.faq.heading}</h2>
          <p className="mt-3 text-white/60 text-lg">{t.faq.sub}</p>
        </div>
        <div className="divide-y divide-white/10 border-t border-b border-white/10">
          {FAQ_ITEMS.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left group"
                >
                  <span className="font-semibold text-lg lg:text-xl pr-4">{item.q[lang]}</span>
                  <span className={`shrink-0 w-9 h-9 grid place-items-center rounded-full border transition-all ${open ? "bg-white text-black border-white rotate-45" : "border-white/20 text-white group-hover:border-white/50"}`}>
                    <Plus className="w-4 h-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-white/60 leading-relaxed max-w-2xl">{item.a[lang]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   12. FOOTER — pakai logo SQRL
   ============================================================ */
function Footer() {
  const { t } = useLang();
  const links = [
    { label: t.footer.home, href: "/" },
    { label: t.footer.events, href: "/events" },
    { label: t.footer.results, href: LINKS.liveRace },
    { label: t.footer.contact, href: "/contact" },
    { label: t.footer.privacy, href: "/privacy" },
    { label: t.footer.terms, href: "/terms" },
  ];
  return (
    <footer className="pt-20 pb-10">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 pb-12 border-b border-white/10">
          <div className="max-w-md">
            <Image
              src="/images/sqrl-logo.png"
              alt="SQRL"
              width={400}
              height={160}
              sizes="(max-width: 768px) 60vw, 220px"
              className="w-[180px] sm:w-[220px] h-auto object-contain"
            />
            <p className="mt-5 text-white/60">{t.footer.tagline}</p>
          </div>
          <nav className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-3 text-sm self-start lg:self-end">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-white/60 hover:text-white transition">{l.label}</Link>
            ))}
          </nav>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/40">{t.footer.copyright}</p>
          <a
            href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm"
          >
            <InstagramIcon className="w-4 h-4" /> {t.footer.social}
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   13. PAGE
   ============================================================ */
export default function EventsPage() {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? (localStorage.getItem("gwis.lang") as Language | null)
        : null;
    if (saved === "en" || saved === "id") setLangState(saved);
  }, []);

  const setLang = (l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("gwis.lang", l);
  };

  const t = DICT[lang];

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>
      <Head>
        <title>EIRC 2026 | SQRL Makassar</title>
        <meta
          name="description"
          content="EIRC 2026 — Eastern inline race weekend hosted by SQRL. 9–11 October 2026 at Karebosi Field, Makassar. Register via Google Form."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="EIRC 2026 | SQRL Makassar" />
        <meta
          property="og:description"
          content="Eastern Indonesia's premier inline race weekend. Schedule, registered clubs, race books, live results."
        />
        <meta property="og:image" content="/images/eirc-2026-og.jpg" />
        <meta property="og:url" content="https://sqrl.id/events" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EIRC 2026" />
        <meta name="twitter:description" content="Inline skate championship — 9–11 Oct 2026, Makassar." />
        <meta name="twitter:image" content="/images/eirc-2026-og.jpg" />
      </Head>

      <main className="min-h-screen bg-[#06070B] text-white overflow-x-hidden font-body">
        <SiteHeader
          lang={lang}
          setLang={setLang}
          currentPath="/events"
          variant="events"
          googleFormUrl={LINKS.googleForm}
        />
        <Hero />
        <Stats />
        <Hub />
        <Social />
        <Location />
        <FAQ />
        <Footer />
      </main>
    </LangCtx.Provider>
  );
}