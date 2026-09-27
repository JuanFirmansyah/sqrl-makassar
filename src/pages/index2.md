import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  ChevronDown,
  MapPin,
  Navigation,
  Radio,
  Sparkles,
  Timer,
  Trophy,
  Users,
  Zap,
  BookMarked,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

/* ============================================================
   INSTAGRAM ICON (SVG — lucide removed it)
   ============================================================ */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
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
type L10n = { en: string; id: string };
type EventStatus = "UPCOMING" | "REGISTRATION_CLOSED" | "LIVE" | "COMPLETED";

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
  city: {
    en: "Makassar, South Sulawesi",
    id: "Makassar, Sulawesi Selatan",
  } as L10n,
  tagline: {
    en: "Eastern Indonesia's biggest inline race weekend.",
    id: "Race weekend inline terbesar di Indonesia Timur.",
  } as L10n,
};

const LINKS = {
  googleForm: "https://docs.google.com/forms/d/e/1FAIpQLSfs3fwKDyzqL72JUJ-cXqKpDv31z71te8eHlBUOdIEcg7XL6g/viewform",
  eventsPage: "/events",
  instagram: "https://www.instagram.com/sqrl.makassar",
  whatsapp: "https://wa.me/6282345006270",
  maps: "https://maps.google.com/?q=Lapangan+Karebosi+Makassar",
};

// const STATS = [
//   {
//     id: "clubs",
//     value: "42",
//     label: { en: "Registered Clubs", id: "Klub Terdaftar" } as L10n,
//   },
//   {
//     id: "athletes",
//     value: "380+",
//     label: { en: "Athletes", id: "Atlet" } as L10n,
//   },
//   {
//     id: "days",
//     value: "3",
//     label: { en: "Race Days", id: "Hari Lomba" } as L10n,
//   },
//   {
//     id: "categories",
//     value: "8+",
//     label: { en: "Categories", id: "Kategori" } as L10n,
//   },
// ];

const PILLARS = [
  {
    id: "speed",
    Icon: Zap,
    color: "#FCD34D",
    title: { en: "Pure Speed", id: "Kecepatan Murni" } as L10n,
    body: {
      en: "From 200M time trials to 3000M relays — every discipline on one track.",
      id: "Dari time trial 200M hingga relay 3000M — semua disiplin di satu lintasan.",
    } as L10n,
  },
  {
    id: "community",
    Icon: Users,
    color: "#A5B4FC",
    title: { en: "Real Community", id: "Komunitas Nyata" } as L10n,
    body: {
      en: "Clubs from across Sulawesi, Kalimantan and eastern Indonesia in one starting line.",
      id: "Klub dari Sulawesi, Kalimantan, dan Indonesia Timur dalam satu garis start.",
    } as L10n,
  },
  {
    id: "legacy",
    Icon: Trophy,
    color: "#F9A8D4",
    title: { en: "Built for Athletes", id: "Dibuat untuk Atlet" } as L10n,
    body: {
      en: "Professional timing, e-certificates, and championship standings you can chase.",
      id: "Timing profesional, e-sertifikat, dan klasemen kejuaraan yang layak dikejar.",
    } as L10n,
  },
];

const TEASERS = [
  {
    id: "schedule",
    Icon: Calendar,
    color: "#67E8F9",
    eyebrow: { en: "Race Weekend", id: "Race Weekend" } as L10n,
    title: { en: "Full Schedule", id: "Jadwal Lengkap" } as L10n,
    desc: {
      en: "Three days, every heat, every discipline.",
      id: "Tiga hari, setiap heat, setiap disiplin.",
    } as L10n,
    href: "/events#schedule",
  },
  {
    id: "clubs",
    Icon: Users,
    color: "#6EE7B7",
    eyebrow: { en: "Start List", id: "Daftar Start" } as L10n,
    title: { en: "Registered Clubs", id: "Klub Terdaftar" } as L10n,
    desc: {
      en: "See who's lining up on race day.",
      id: "Lihat siapa yang akan berlomba.",
    } as L10n,
    href: "/events#clubs",
  },
  {
    id: "books",
    Icon: BookMarked,
    color: "#FCD34D",
    eyebrow: { en: "Documents", id: "Dokumen" } as L10n,
    title: { en: "THB & Race Books", id: "THB & Race Book" } as L10n,
    desc: {
      en: "Technical handbook, heat draw, athlete list.",
      id: "Panduan teknis, heat draw, daftar atlet.",
    } as L10n,
    href: "/events#documents",
  },
  {
    id: "live",
    Icon: Radio,
    color: "#FCA5A5",
    eyebrow: { en: "Race Day", id: "Hari Lomba" } as L10n,
    title: { en: "Live Race", id: "Live Race" } as L10n,
    desc: {
      en: "Follow timing and results as they happen.",
      id: "Ikuti timing dan hasil secara langsung.",
    } as L10n,
    href: "/events#hub",
  },
];

/* ============================================================
   3. I18N DICTIONARY
   ============================================================ */
type Dict = {
  cta: {
    events: string;
    register: string;
    watch: string;
    viewMap: string;
    back: string;
  };
  hero: { eyebrow: string; sub: string; scroll: string };
  countdown: {
    heading: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    live: string;
    completed: string;
    closed: string;
  };
  stats: { heading: string };
  pillars: { heading: string; sub: string };
  teasers: { heading: string; sub: string };
  location: {
    heading: string;
    venue: string;
    city: string;
    time: string;
  };
  finalCta: { heading: string; sub: string; button: string };
  footer: {
    tagline: string;
    copyright: string;
    links: { home: string; events: string; instagram: string; whatsapp: string };
  };
};

const DICT: Record<Language, Dict> = {
  en: {
    cta: {
      events: "Enter Event Hub",
      register: "Register Now",
      watch: "Watch Race",
      viewMap: "Open in Maps",
      back: "Back to Landing",
    },
    hero: {
      eyebrow: "SQRL Presents",
      sub: "09 — 11 OCTOBER 2026",
      scroll: "Scroll to explore",
    },
    countdown: {
      heading: "Event Starts In",
      days: "Days",
      hours: "Hrs",
      minutes: "Min",
      seconds: "Sec",
      live: "Live Now",
      completed: "Event Completed",
      closed: "Registration Closed",
    },
    stats: { heading: "By The Numbers" },
    pillars: { heading: "Why EIRC", sub: "Built on three things." },
    teasers: {
      heading: "What's Inside",
      sub: "The full event hub has everything you need.",
    },
    location: {
      heading: "See You in Makassar",
      venue: "Lapangan Karebosi",
      city: "Makassar, South Sulawesi",
      time: "Starts 07:30 WITA daily",
    },
    finalCta: {
      heading: "The Track Is Waiting.",
      sub: "Registration closes 02 October 2026.",
      button: "Register Via Google Form",
    },
    footer: {
      tagline: "Precision on wheels. Pride from Makassar.",
      copyright: "© 2026 SQRL. ALL RIGHTS RESERVED.",
      links: {
        home: "Home",
        events: "Events",
        instagram: "Instagram",
        whatsapp: "WhatsApp",
      },
    },
  },
  id: {
    cta: {
      events: "Masuk ke Event Hub",
      register: "Daftar Sekarang",
      watch: "Tonton Race",
      viewMap: "Buka di Maps",
      back: "Kembali ke Landing",
    },
    hero: {
      eyebrow: "SQRL Mempersembahkan",
      sub: "09 — 11 OKTOBER 2026",
      scroll: "Scroll untuk jelajah",
    },
    countdown: {
      heading: "Event Dimulai Dalam",
      days: "Hari",
      hours: "Jam",
      minutes: "Mnt",
      seconds: "Dtk",
      live: "Sedang Berlangsung",
      completed: "Event Selesai",
      closed: "Pendaftaran Ditutup",
    },
    stats: { heading: "Dalam Angka" },
    pillars: { heading: "Kenapa EIRC", sub: "Dibangun dari tiga hal." },
    teasers: {
      heading: "Yang Ada di Dalam",
      sub: "Event hub lengkap punya semua yang kamu butuh.",
    },
    location: {
      heading: "Sampai Jumpa di Makassar",
      venue: "Lapangan Karebosi",
      city: "Makassar, Sulawesi Selatan",
      time: "Mulai 07:30 WITA setiap hari",
    },
    finalCta: {
      heading: "Lintasan Sudah Menunggu.",
      sub: "Pendaftaran ditutup 02 Oktober 2026.",
      button: "Daftar via Google Form",
    },
    footer: {
      tagline: "Presisi di atas roda. Kebanggaan dari Makassar.",
      copyright: "© 2026 SQRL. HAK CIPTA DILINDUNGI.",
      links: {
        home: "Home",
        events: "Event",
        instagram: "Instagram",
        whatsapp: "WhatsApp",
      },
    },
  },
};

/* ============================================================
   4. HELPERS
   ============================================================ */
const pad = (n: number) => String(n).padStart(2, "0");

function getStatus(now: Date = new Date()): EventStatus {
  const s = new Date(EVENT.startDate).getTime();
  const e = new Date(EVENT.endDate).getTime();
  const d = new Date(EVENT.registrationDeadline).getTime();
  const t = now.getTime();
  if (t >= s && t <= e) return "LIVE";
  if (t > e) return "COMPLETED";
  if (t >= d || !EVENT.registrationOpen) return "REGISTRATION_CLOSED";
  return "UPCOMING";
}

/* ============================================================
   5. HERO — pakai logo EIRC
   ============================================================ */
function Hero({ lang, t }: { lang: Language; t: Dict }) {
  const reduce = useReducedMotion();
  const status = getStatus();
  const showRegister = status === "UPCOMING" && EVENT.registrationOpen;

  const fade = (d = 0) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.7,
      delay: reduce ? 0 : d,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  });

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden pt-20 lg:pt-0">
      {/* Background glows */}
      <div className="pointer-events-none absolute top-[-20%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[#2563EB]/25 blur-[160px]" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-15%] w-[700px] h-[700px] rounded-full bg-[#F97316]/15 blur-[160px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#8B5CF6]/10 blur-[180px]" />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 w-full py-16 lg:py-24">
        {/* Eyebrow */}
        <motion.div
          {...fade(0)}
          className="flex items-center gap-4 mb-8 lg:mb-10"
        >
          <span className="h-[1px] w-10 bg-[#A5B4FC]/60" />
          <p className="text-[11px] sm:text-[12px] font-bold tracking-[0.35em] uppercase text-[#A5B4FC]">
            {t.hero.eyebrow}
          </p>
        </motion.div>

        {/* Logo EIRC (menggantikan tulisan "EIRC 2026") */}
        <motion.div
          {...fade(0.1)}
          className="relative w-full max-w-[560px] sm:max-w-[720px] lg:max-w-[900px]"
        >
          <Image
            src="/images/eirc-logo.png"
            alt="EIRC 2026 — Eastern Indonesia Inline Race Championship"
            width={1280}
            height={640}
            priority
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 900px"
            className="w-full h-auto object-contain drop-shadow-[0_0_60px_rgba(59,130,246,0.35)]"
          />
        </motion.div>

        {/* Tagline row */}
        <motion.div
          {...fade(0.3)}
          className="mt-8 lg:mt-12 grid lg:grid-cols-[1fr_auto] gap-8 items-end"
        >
          <div className="max-w-xl">
            <p className="text-white/75 text-lg lg:text-2xl leading-relaxed font-light">
              {EVENT.tagline[lang]}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 text-white/85 font-semibold tracking-wide">
                <Calendar className="w-4 h-4 text-[#FCD34D]" />
                {t.hero.sub}
              </span>
              <span className="inline-flex items-center gap-2 text-white/85 font-semibold tracking-wide">
                <MapPin className="w-4 h-4 text-[#67E8F9]" />
                {EVENT.city[lang].toUpperCase()}
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={LINKS.eventsPage}
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white text-black hover:bg-white/90 px-7 py-4 font-bold tracking-widest text-[13px] uppercase transition"
            >
              {t.cta.events}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            {showRegister ? (
              <a
                href={LINKS.googleForm}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] px-7 py-4 font-bold tracking-widest text-[13px] uppercase transition shadow-xl shadow-orange-500/25"
              >
                {t.cta.register}
                <ArrowUpRight className="w-4 h-4" />
              </a>
            ) : (
              <span className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-7 py-4 font-bold tracking-widest text-[13px] uppercase text-white/50">
                {t.countdown.closed}
              </span>
            )}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduce ? 0 : 1.4, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">
            {t.hero.scroll}
          </span>
          <motion.span
            animate={reduce ? {} : { y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   6. COUNTDOWN STRIP
   ============================================================ */
function CountdownStrip({ t }: { t: Dict }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = now ? getStatus(now) : "UPCOMING";
  if (!now) return null;

  const target =
    status === "UPCOMING" ? new Date(EVENT.startDate) : new Date(EVENT.endDate);
  const d = Math.max(0, target.getTime() - now.getTime());
  const parts = {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
  const cells = [
    { label: t.countdown.days, value: parts.days },
    { label: t.countdown.hours, value: parts.hours },
    { label: t.countdown.minutes, value: parts.minutes },
    { label: t.countdown.seconds, value: parts.seconds },
  ];

  const heading =
    status === "LIVE"
      ? t.countdown.live
      : status === "COMPLETED"
        ? t.countdown.completed
        : status === "REGISTRATION_CLOSED"
          ? t.countdown.closed
          : t.countdown.heading;

  return (
    <section className="relative border-y border-white/10 bg-gradient-to-r from-[#0A0E18] via-[#0B0F1A] to-[#0A0E18] overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 40px)",
        }}
      />
      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-8 lg:py-10">
        <div className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-16 items-center">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full ${
                status === "LIVE" ? "bg-[#EF4444] animate-pulse" : "bg-[#FCD34D]"
              }`}
            />
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/60">
              {heading}
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-6 justify-start lg:justify-end overflow-x-auto">
            {cells.map((c, i) => (
              <div key={c.label} className="flex items-baseline gap-2 shrink-0">
                <span className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-none tabular-nums">
                  {pad(c.value)}
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-white/40 pb-2">
                  {c.label}
                </span>
                {i < cells.length - 1 && (
                  <span className="font-display italic text-4xl text-white/15 ml-4 lg:ml-6">
                    :
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. PILLARS
   ============================================================ */
function Pillars({ lang, t }: { lang: Language; t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-12 lg:mb-16 max-w-2xl">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
            {t.pillars.heading}
          </h2>
          <p className="mt-4 text-white/60 text-lg">{t.pillars.sub}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: reduce ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-7 lg:p-8 min-h-[260px] flex flex-col justify-between hover:border-white/20 transition"
            >
              <div
                className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition"
                style={{ background: p.color }}
              />
              <div className="relative">
                <div
                  className="w-14 h-14 rounded-2xl grid place-items-center mb-6"
                  style={{ background: `${p.color}25`, color: p.color }}
                >
                  <p.Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="relative">
                <h3 className="font-display italic text-3xl lg:text-4xl leading-none">
                  {p.title[lang]}
                </h3>
                <p className="mt-4 text-white/60 text-sm leading-relaxed">
                  {p.body[lang]}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   9. TEASERS
   ============================================================ */
function Teasers({ lang, t }: { lang: Language; t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div>
            <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
              {t.teasers.heading}
            </h2>
            <p className="mt-3 text-white/60 text-lg max-w-xl">
              {t.teasers.sub}
            </p>
          </div>
          <Link
            href={LINKS.eventsPage}
            className="group inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.3em] uppercase text-white/60 hover:text-white transition self-start lg:self-end"
          >
            {t.cta.events}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEASERS.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: reduce ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Link
                href={card.href}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-6 lg:p-7 min-h-[220px] flex flex-col justify-between transition"
              >
                <div
                  className="w-12 h-12 rounded-xl grid place-items-center transition-transform group-hover:-rotate-6"
                  style={{ background: `${card.color}25`, color: card.color }}
                >
                  <card.Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40 mb-2">
                    {card.eyebrow[lang]}
                  </p>
                  <h3 className="font-display italic text-2xl lg:text-3xl leading-none">
                    {card.title[lang]}
                  </h3>
                  <p className="mt-2 text-xs text-white/55 leading-relaxed">
                    {card.desc[lang]}
                  </p>
                  <div
                    className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: card.color }}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   10. LOCATION
   ============================================================ */
function Location({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0B0D14] via-[#0B0D14] to-[#0F172A]"
        >
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#F97316]/15 blur-[140px]" />

          <div className="relative grid lg:grid-cols-2">
            {/* Left: info */}
            <div className="p-8 lg:p-14 xl:p-16 flex flex-col justify-center">
              <span className="h-[1px] w-10 bg-[#A5B4FC]/60 mb-6" />
              <p className="text-[11px] font-bold tracking-[0.35em] uppercase text-[#A5B4FC] mb-4">
                Venue
              </p>
              <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
                {t.location.heading}
              </h2>
              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F97316]/20 text-[#FDBA74] grid place-items-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t.location.venue}</p>
                    <p className="text-white/60 text-sm mt-1">
                      {t.location.city}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#FCD34D]/20 text-[#FCD34D] grid place-items-center shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{t.location.time}</p>
                    <p className="text-white/60 text-sm mt-1">
                      09 — 11 October 2026
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-3 rounded-xl border border-white/15 hover:bg-white/5 px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition self-start"
              >
                <Navigation className="w-4 h-4" />
                {t.cta.viewMap}
              </a>
            </div>

            {/* Right: map visual */}
            <div className="relative min-h-[320px] lg:min-h-0">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 30%, rgba(59,130,246,0.4), transparent 60%), radial-gradient(circle at 70% 70%, rgba(249,115,22,0.35), transparent 60%), repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0B0D14]/80" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-[#F97316]/30 grid place-items-center animate-ping absolute inset-0" />
                  <div className="relative w-16 h-16 rounded-full bg-[#F97316] grid place-items-center shadow-2xl shadow-orange-500/50">
                    <MapPin className="w-7 h-7" />
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 inline-flex items-center gap-3 rounded-xl bg-black/60 backdrop-blur border border-white/10 px-4 py-3">
                <Navigation className="w-4 h-4 text-[#FDBA74] shrink-0" />
                <p className="text-xs text-white/80 tracking-wide truncate">
                  Lapangan Karebosi, Makassar
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   11. FINAL CTA
   ============================================================ */
function FinalCta({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  const status = getStatus();
  const showRegister = status === "UPCOMING" && EVENT.registrationOpen;

  return (
    <section className="relative border-b border-white/5 py-20 lg:py-32 overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[#F97316]/10 blur-[160px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 text-center">
        <motion.h2
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="font-display italic text-6xl sm:text-7xl lg:text-9xl xl:text-[150px] leading-[0.9] bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent"
        >
          {t.finalCta.heading}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-6 text-white/60 text-lg max-w-xl mx-auto"
        >
          {t.finalCta.sub}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
        >
          {showRegister ? (
            <a
              href={LINKS.googleForm}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] px-8 py-5 font-bold tracking-widest text-[13px] uppercase transition shadow-2xl shadow-orange-500/30"
            >
              <Sparkles className="w-4 h-4" />
              {t.finalCta.button}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </a>
          ) : (
            <span className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 px-8 py-5 font-bold tracking-widest text-[13px] uppercase text-white/50">
              {t.countdown.closed}
            </span>
          )}
          <Link
            href={LINKS.eventsPage}
            className="group inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 hover:bg-white/5 px-8 py-5 font-bold tracking-widest text-[13px] uppercase transition"
          >
            {t.cta.events}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   12. FOOTER — pakai logo SQRL
   ============================================================ */
function Footer({ t }: { t: Dict }) {
  return (
    <footer className="pt-20 pb-10">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 pb-12 border-b border-white/10">
          <div className="max-w-md">
            {/* Logo SQRL image (menggantikan tulisan "SQRL") */}
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
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-3 text-sm self-start lg:self-end">
            <Link href="/" className="text-white/60 hover:text-white transition">
              {t.footer.links.home}
            </Link>
            <Link
              href="/events"
              className="text-white/60 hover:text-white transition"
            >
              {t.footer.links.events}
            </Link>
            <a
              href={LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition"
            >
              {t.footer.links.instagram}
            </a>
            <a
              href={LINKS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition"
            >
              {t.footer.links.whatsapp}
            </a>
          </nav>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/40">
            {t.footer.copyright}
          </p>
          <a
            href={LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm"
          >
            <InstagramIcon className="w-4 h-4" /> @sqrl.makassar
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   13. PAGE
   ============================================================ */
export default function HomePage() {
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
    <>
      <Head>
        <title>
          EIRC 2026 | SQRL Makassar — Eastern Indonesia Inline Race Championship
        </title>
        <meta
          name="description"
          content="EIRC 2026 — Eastern Indonesia's biggest inline race weekend hosted by SQRL. 9–11 October 2026 at Karebosi Field, Makassar."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="EIRC 2026 | SQRL Makassar" />
        <meta
          property="og:description"
          content="Eastern Indonesia's biggest inline race weekend. 9–11 Oct 2026, Karebosi Field, Makassar."
        />
        <meta property="og:image" content="/images/eirc-2026-og.jpg" />
        <meta property="og:url" content="https://sqrl.id/" />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="EIRC 2026 | SQRL Makassar" />
        <meta
          name="twitter:description"
          content="9–11 Oct 2026 · Karebosi Field, Makassar."
        />
        <meta name="twitter:image" content="/images/eirc-2026-og.jpg" />
      </Head>

      <div className="min-h-screen bg-[#06070B] text-white overflow-x-hidden font-body">
        <SiteHeader
          lang={lang}
          setLang={setLang}
          currentPath="/"
          variant="landing"
          googleFormUrl={LINKS.googleForm}
        />
        <main>
          <Hero lang={lang} t={t} />
          <CountdownStrip t={t} />
          <Pillars lang={lang} t={t} />
          <Teasers lang={lang} t={t} />
          <Location t={t} />
          <FinalCta t={t} />
        </main>
        <Footer t={t} />
      </div>
    </>
  );
}