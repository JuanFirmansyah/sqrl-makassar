import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, Award, Baby, BarChart3, BookMarked, BookOpen,
  Calendar, CheckCircle2, ChevronRight, Clock, Flag, Flame,
  Lock, MapPin, MessageCircle, Navigation, Play, Plus, Radio, Search,
  Sparkles, Star, Timer, Trophy, Users, Users2, X, Zap,
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

interface Club {
  id: number;
  name: string;
  athletes: number;
  status: "REGISTERED";
}

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
  whatsapp: "https://wa.me/6281234567890",
  googleForm: "https://forms.gle/1ARC5m1Go4pogJPG8",
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

const PRE_RACE = [
  { id: "reg", date: "02 OCT", label: { en: "Registration Deadline", id: "Batas Pendaftaran" } },
  { id: "pay", date: "04 OCT", label: { en: "Payment Clearance", id: "Verifikasi Pembayaran" } },
  { id: "tm", date: "08 OCT", label: { en: "Technical Meeting", id: "Technical Meeting" }, time: "16:00 – 18:00" },
];

const SCHEDULE = [
  {
    id: "d1", label: { en: "Day 01", id: "Hari 01" },
    date: "09 OCT", dateLabel: "Friday", time: "07:30 — FINISH",
    events: [
      { en: "Elimination / Point Race Speed", id: "Elimination / Point Race Speed" },
      { en: "Sprint 500M Standard & Speed", id: "Sprint 500M Standard & Speed" },
      { en: "Team Sprint 500M+D Speed", id: "Team Sprint 500M+D Speed" },
    ],
  },
  {
    id: "d2", label: { en: "Day 02", id: "Hari 02" },
    date: "10 OCT", dateLabel: "Saturday", time: "07:30 — FINISH",
    events: [
      { en: "Sprint 300M Beginners & Standard", id: "Sprint 300M Beginners & Standard" },
      { en: "ITT 200M Speed", id: "ITT 200M Speed" },
      { en: "Sprint 1000M Standard & Speed", id: "Sprint 1000M Standard & Speed" },
    ],
  },
  {
    id: "d3", label: { en: "Day 03", id: "Hari 03" },
    date: "11 OCT", dateLabel: "Sunday", time: "07:30 — FINISH",
    events: [
      { en: "Beginners", id: "Beginners" },
      { en: "Relay 1800M Standard", id: "Relay 1800M Standard" },
      { en: "Relay 3000M Speed", id: "Relay 3000M Speed" },
    ],
  },
];

const EVENT_LINKS: Array<{
  id: string; eyebrow: L10n; title: L10n; description: L10n; cta: L10n;
  href: string; icon: string; color: HubColor; external?: boolean;
}> = [
  { id: "whatsapp", eyebrow: { en: "Contact", id: "Kontak" }, title: { en: "Admin EIRC 2026", id: "Admin EIRC 2026" }, description: { en: "Chat with our race admin for anything you need.", id: "Hubungi admin untuk pertanyaan seputar lomba." }, cta: { en: "Chat on WhatsApp", id: "Chat WhatsApp" }, href: LINKS.whatsapp, icon: "MessageCircle", color: "blue", external: true },
  { id: "register", eyebrow: { en: "Registration", id: "Pendaftaran" }, title: { en: "Register Your Team", id: "Daftarkan Tim Kamu" }, description: { en: "Sign up through our official Google Form.", id: "Daftar via Google Form resmi kami." }, cta: { en: "Open Form", id: "Buka Form" }, href: LINKS.googleForm, icon: "Sparkles", color: "peach", external: true },
  { id: "thb", eyebrow: { en: "Handbook", id: "Panduan" }, title: { en: "THB", id: "THB" }, description: { en: "Regulations, schedule and technical race requirements.", id: "Peraturan, jadwal, dan ketentuan teknis lomba." }, cta: { en: "Read Now", id: "Baca Sekarang" }, href: LINKS.thbPdf, icon: "BookOpen", color: "green", external: true },
  { id: "live-race", eyebrow: { en: "Race Day", id: "Hari Lomba" }, title: { en: "Live Race Results", id: "Hasil Live Race" }, description: { en: "Official timing and final placements for all categories.", id: "Hasil resmi dan klasemen akhir semua kategori." }, cta: { en: "View Results", id: "Lihat Hasil" }, href: LINKS.liveRace, icon: "Flag", color: "purple" },
  { id: "books", eyebrow: { en: "Documents", id: "Dokumen" }, title: { en: "Event Books", id: "Buku Event" }, description: { en: "Athlete list, heat draw, and complete event rundown.", id: "Daftar atlet, heat draw, dan rundown event lengkap." }, cta: { en: "Choose Book", id: "Pilih Buku" }, href: "#documents", icon: "BookMarked", color: "brown" },
  { id: "e-cert", eyebrow: { en: "Certificate", id: "Sertifikat" }, title: { en: "E-Certificate", id: "E-Sertifikat" }, description: { en: "Download official e-certificates for athletes and clubs.", id: "Unduh e-sertifikat resmi untuk atlet dan klub." }, cta: { en: "Get Certificate", id: "Ambil Sertifikat" }, href: LINKS.eCertificate, icon: "Award", color: "cyan" },
  { id: "twibbon", eyebrow: { en: "Social", id: "Sosial" }, title: { en: "Twibbon", id: "Twibbon" }, description: { en: "Frame your race photos and support your club.", id: "Bingkai fotomu dan dukung klubmu." }, cta: { en: "Get Twibbon", id: "Ambil Twibbon" }, href: LINKS.twibbon, icon: "Sparkles", color: "pink" },
  { id: "live-stream", eyebrow: { en: "Broadcast", id: "Siaran" }, title: { en: "Live Streaming", id: "Live Streaming" }, description: { en: "Follow the race live from wherever you are.", id: "Ikuti lomba secara live dari mana saja." }, cta: { en: "Watch Live", id: "Tonton Live" }, href: LINKS.liveStream, icon: "Radio", color: "yellow", external: true },
];

const RACE_CATEGORIES = [
  { id: "beginners", name: "BEGINNERS", description: { en: "First-time racers welcome.", id: "Untuk pemula." }, icon: "Baby", accent: "#6EE7B7" },
  { id: "standard", name: "STANDARD", description: { en: "The core racing class.", id: "Kelas utama." }, icon: "Users", accent: "#A5B4FC" },
  { id: "speed", name: "SPEED", description: { en: "Pure velocity.", id: "Kecepatan murni." }, icon: "Zap", accent: "#FCA5A5" },
  { id: "sprint", name: "SPRINT", description: { en: "Explosive short distance.", id: "Jarak pendek eksplosif." }, icon: "Flame", accent: "#FDBA74" },
  { id: "itt", name: "ITT", description: { en: "Individual time trial.", id: "Time trial individu." }, icon: "Timer", accent: "#67E8F9" },
  { id: "relay", name: "RELAY", description: { en: "Teamwork on wheels.", id: "Kerja sama tim." }, icon: "Users2", accent: "#C4B5FD" },
];

const REGISTERED_CLUBS: Club[] = [
  { id: 1, name: "SQRL Makassar", athletes: 28, status: "REGISTERED" },
  { id: 2, name: "Sulawesi Speed Skaters", athletes: 22, status: "REGISTERED" },
  { id: 3, name: "Celebes Inline Team", athletes: 18, status: "REGISTERED" },
  { id: 4, name: "Bugis Roller Club", athletes: 15, status: "REGISTERED" },
  { id: 5, name: "Toraja Skate Crew", athletes: 12, status: "REGISTERED" },
  { id: 6, name: "Palu Inline Squad", athletes: 14, status: "REGISTERED" },
  { id: 7, name: "Kendari Roller Kids", athletes: 10, status: "REGISTERED" },
  { id: 8, name: "Ambon Skate Union", athletes: 9, status: "REGISTERED" },
  { id: 9, name: "Jayapura Roller Club", athletes: 8, status: "REGISTERED" },
  { id: 10, name: "Balikpapan Speed Crew", athletes: 16, status: "REGISTERED" },
  { id: 11, name: "Samarinda Inline Academy", athletes: 11, status: "REGISTERED" },
  { id: 12, name: "Banjarmasin Roller Team", athletes: 13, status: "REGISTERED" },
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
    eyebrow: string; title1: string; title2: string; tagline: string;
    ctaPrimary: string; ctaSecondary: string; ctaRegister: string; ctaClosed: string;
  };
  status: {
    heading: string; upcoming: string; registrationClosed: string; live: string;
    completed: string; days: string; hours: string; minutes: string; seconds: string;
    sub: string; liveSub: string; completedSub: string;
  };
  hub: { heading: string; sub: string; hint: string };
  raceControl: {
    heading: string; live: string; upcoming: string; completed: string;
    registrationClosed: string; inProgress: string; viewLive: string;
    notStarted: string; finished: string;
  };
  schedule: { heading: string; pre: string; sub: string };
  categories: { heading: string; sub: string };
  clubs: {
    heading: string; sub: string; search: string; no: string; club: string;
    athletes: string; status: string; registered: string; loadMore: string;
    showing: string; of: string; noResults: string;
  };
  modal: { close: string; athletes: string; status: string; note: string };
  awards: {
    heading: string; sub: string; overall: string; overallDesc: string;
    mvp: string; mvpDesc: string; cta: string;
  };
  stream: { heading: string; sub: string; cta: string; live: string; placeholder: string };
  docs: {
    heading: string; sub: string;
    athleteTitle: string; athleteDesc: string; athleteCta: string;
    raceTitle: string; raceDesc: string; raceCta: string;
    thbTitle: string; thbDesc: string; thbCta: string;
  };
  cert: { heading: string; sub: string; cta: string };
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
      title1: "EIRC",
      title2: "2026",
      tagline: "Three days. One arena. Makassar becomes the fastest city in the east.",
      ctaPrimary: "View Event Details",
      ctaSecondary: "Registered Clubs",
      ctaRegister: "Register Now",
      ctaClosed: "Registration Closed",
    },
    status: {
      heading: "Event Status", upcoming: "Event Starts In", registrationClosed: "Registration Closed",
      live: "Live Now", completed: "Event Completed",
      days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds",
      sub: "Countdown to race weekend", liveSub: "Race day in progress — follow it live.",
      completedSub: "Thanks for racing with us.",
    },
    hub: { heading: "Everything You Need", sub: "For race day", hint: "Quick access & data" },
    raceControl: {
      heading: "Race Control", live: "Live", upcoming: "Upcoming", completed: "Event Completed",
      registrationClosed: "Registration Closed", inProgress: "In Progress",
      viewLive: "View Live Race", notStarted: "Race will start soon", finished: "See you next season",
    },
    schedule: { heading: "Race Weekend", pre: "Pre-Race", sub: "Three days, eight categories, endless speed." },
    categories: { heading: "Choose Your Race", sub: "Pick your battle." },
    clubs: {
      heading: "The Starting Line", sub: "clubs. Hundreds of athletes. One starting line.",
      search: "Search clubs...", no: "No", club: "Club Name", athletes: "Athletes", status: "Status",
      registered: "Registered", loadMore: "Load More", showing: "Showing", of: "of", noResults: "No clubs found.",
    },
    modal: { close: "Close", athletes: "Athletes", status: "Status", note: "Athlete list will be published in the Athlete Book." },
    awards: {
      heading: "Chasing The Podium", sub: "Every second counts. Every podium earns glory.",
      overall: "Overall Champion", overallDesc: "The club that dominates all categories.",
      mvp: "MVP Awards", mvpDesc: "Standout individual performances.",
      cta: "View Championship Standings",
    },
    stream: { heading: "Watch The Race", sub: "Follow the competition wherever you are.", cta: "Watch Live", live: "Live", placeholder: "Broadcast begins on race day" },
    docs: {
      heading: "Official Event Documents", sub: "Everything in one place.",
      athleteTitle: "Athlete Book", athleteDesc: "Participant profiles & athlete list", athleteCta: "View Athlete Book",
      raceTitle: "Race Book", raceDesc: "Heat draw & complete race schedule", raceCta: "View Race Book",
      thbTitle: "Technical Handbook", thbDesc: "Regulations, schedule and technical race requirements.", thbCta: "Read Handbook",
    },
    cert: { heading: "Your Race. Your Record.", sub: "Download your official EIRC certificate.", cta: "Get E-Certificate" },
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
      title1: "EIRC",
      title2: "2026",
      tagline: "Tiga hari. Satu arena. Makassar jadi kota tercepat di timur.",
      ctaPrimary: "Lihat Detail Event",
      ctaSecondary: "Klub Terdaftar",
      ctaRegister: "Daftar Sekarang",
      ctaClosed: "Pendaftaran Ditutup",
    },
    status: {
      heading: "Status Event", upcoming: "Event Dimulai Dalam", registrationClosed: "Pendaftaran Ditutup",
      live: "Sedang Berlangsung", completed: "Event Selesai",
      days: "Hari", hours: "Jam", minutes: "Menit", seconds: "Detik",
      sub: "Hitung mundur ke race weekend", liveSub: "Hari lomba sedang berlangsung — ikuti live.",
      completedSub: "Terima kasih sudah berlomba bersama kami.",
    },
    hub: { heading: "Semua yang Kamu Butuhkan", sub: "Untuk race day", hint: "Akses cepat & data" },
    raceControl: {
      heading: "Race Control", live: "Live", upcoming: "Akan Datang", completed: "Event Selesai",
      registrationClosed: "Pendaftaran Ditutup", inProgress: "Sedang Berlangsung",
      viewLive: "Lihat Live Race", notStarted: "Lomba akan segera dimulai", finished: "Sampai jumpa musim depan",
    },
    schedule: { heading: "Race Weekend", pre: "Pra-Lomba", sub: "Tiga hari, delapan kategori, kecepatan tanpa henti." },
    categories: { heading: "Pilih Lomba Kamu", sub: "Tentukan medan juangmu." },
    clubs: {
      heading: "Garis Start", sub: "klub. Ratusan atlet. Satu garis start.",
      search: "Cari klub...", no: "No", club: "Nama Klub", athletes: "Atlet", status: "Status",
      registered: "Terdaftar", loadMore: "Muat Lebih", showing: "Menampilkan", of: "dari", noResults: "Klub tidak ditemukan.",
    },
    modal: { close: "Tutup", athletes: "Atlet", status: "Status", note: "Daftar atlet akan dipublikasikan di Athlete Book." },
    awards: {
      heading: "Mengejar Podium", sub: "Setiap detik berarti. Setiap podium adalah kejayaan.",
      overall: "Juara Umum", overallDesc: "Klub yang mendominasi semua kategori.",
      mvp: "Penghargaan MVP", mvpDesc: "Penampilan individu terbaik.",
      cta: "Lihat Klasemen Kejuaraan",
    },
    stream: { heading: "Tonton Lomba", sub: "Ikuti kompetisi dari mana saja.", cta: "Tonton Live", live: "Live", placeholder: "Siaran mulai di hari lomba" },
    docs: {
      heading: "Dokumen Resmi Event", sub: "Semuanya di satu tempat.",
      athleteTitle: "Athlete Book", athleteDesc: "Profil peserta & daftar atlet", athleteCta: "Lihat Athlete Book",
      raceTitle: "Race Book", raceDesc: "Heat draw & jadwal lomba lengkap", raceCta: "Lihat Race Book",
      thbTitle: "Buku Panduan Teknis", thbDesc: "Peraturan, jadwal, dan ketentuan teknis lomba.", thbCta: "Baca Panduan",
    },
    cert: { heading: "Lombamu. Rekormu.", sub: "Unduh sertifikat resmi EIRC kamu.", cta: "Ambil E-Sertifikat" },
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
const pad = (n: number) => String(n).padStart(2, "0");

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
  MessageCircle, BarChart3, BookOpen, Flag, BookMarked, Award,
  Sparkles, Radio, Baby, Users, Zap, Flame, Timer, Users2,
};

/* ============================================================
   6. HERO
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

          <motion.h1
            {...fade(0.1)}
            className="font-display italic leading-[0.85] tracking-tight text-white text-[19vw] sm:text-[15vw] lg:text-[10vw] xl:text-[132px]"
          >
            <span className="block">{t.hero.title1}</span>
            <span className="block bg-gradient-to-r from-[#A5B4FC] via-[#67E8F9] to-[#FCD34D] bg-clip-text text-transparent">
              {t.hero.title2}
            </span>
          </motion.h1>

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
              href="#schedule"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition shadow-xl shadow-blue-600/30"
            >
              {t.hero.ctaPrimary}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="#clubs"
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
            src="/images/eirc-2026-artwork.jpg"
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
   7. EVENT STATUS / COUNTDOWN
   ============================================================ */
function Status() {
  const { t } = useLang();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const status: EventStatus = useMemo(() => getEventStatus(now ?? new Date()), [now]);
  if (!now) return null;

  const target = status === "UPCOMING" ? new Date(EVENT.startDate) : new Date(EVENT.endDate);
  const d = Math.max(0, target.getTime() - now.getTime());
  const parts = {
    days: Math.floor(d / 86400000),
    hours: Math.floor((d % 86400000) / 3600000),
    minutes: Math.floor((d % 3600000) / 60000),
    seconds: Math.floor((d % 60000) / 1000),
  };
  const cells = [
    { label: t.status.days, value: parts.days },
    { label: t.status.hours, value: parts.hours },
    { label: t.status.minutes, value: parts.minutes },
    { label: t.status.seconds, value: parts.seconds },
  ];

  const headline =
    status === "LIVE" ? t.status.live :
    status === "COMPLETED" ? t.status.completed :
    status === "REGISTRATION_CLOSED" ? t.status.registrationClosed :
    t.status.upcoming;

  const sub =
    status === "LIVE" ? t.status.liveSub :
    status === "COMPLETED" ? t.status.completedSub :
    t.status.sub;

  const Icon =
    status === "LIVE" ? Radio :
    status === "COMPLETED" ? Trophy :
    status === "REGISTRATION_CLOSED" ? Lock : Timer;

  return (
    <section className="border-b border-white/5 bg-[#080A12]">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="flex-1">
            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40 mb-3">
              {t.status.heading}
            </p>
            <h2 className="flex items-center gap-3 font-display italic text-4xl sm:text-5xl lg:text-6xl leading-none">
              <Icon className={`w-8 h-8 lg:w-10 lg:h-10 ${status === "LIVE" ? "text-[#EF4444] animate-pulse" : "text-[#FCD34D]"}`} />
              {headline}
            </h2>
            <p className="mt-3 text-white/60 max-w-md">{sub}</p>
          </div>

          {(status === "UPCOMING" || status === "REGISTRATION_CLOSED") && (
            <div className="grid grid-cols-4 gap-3 sm:gap-5">
              {cells.map((c) => (
                <div key={c.label} className="min-w-[70px] sm:min-w-[92px] rounded-2xl border border-white/10 bg-white/[0.03] px-3 sm:px-5 py-4 text-center">
                  <div className="font-display italic text-4xl sm:text-5xl lg:text-6xl leading-none tabular-nums overflow-hidden h-[1em] relative">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={c.value}
                        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}
                        transition={{ duration: 0.3 }}
                        className="block"
                      >
                        {pad(c.value)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-white/50">{c.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. EVENT STATS
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
   9. EVENT HUB
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
   10. LIVE RACE CARD
   ============================================================ */
function LiveRace() {
  const { t } = useLang();
  const status = getEventStatus();
  const config = {
    LIVE: { label: t.raceControl.live, color: "#EF4444", Icon: Radio, sub: t.raceControl.inProgress },
    UPCOMING: { label: t.raceControl.upcoming, color: "#FCD34D", Icon: Clock, sub: t.raceControl.notStarted },
    REGISTRATION_CLOSED: { label: t.raceControl.registrationClosed, color: "#A5B4FC", Icon: Clock, sub: t.raceControl.notStarted },
    COMPLETED: { label: t.raceControl.completed, color: "#22C55E", Icon: Trophy, sub: t.raceControl.finished },
  }[status];
  const { Icon } = config;

  return (
    <section className="border-b border-white/5">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-14 lg:py-20">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0B0D14] via-[#0B0D14] to-[#111827] p-8 lg:p-12">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[120px] opacity-30" style={{ background: config.color }} />
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/40 mb-4">{t.raceControl.heading}</p>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase" style={{ background: `${config.color}20`, color: config.color }}>
                  <span className={`w-2 h-2 rounded-full ${status === "LIVE" ? "animate-pulse" : ""}`} style={{ background: config.color }} />
                  {config.label}
                </span>
              </div>
              <h2 className="font-display italic text-4xl sm:text-5xl lg:text-6xl leading-[0.95] flex items-center gap-4">
                <Icon className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: config.color }} />
                {config.sub}
              </h2>
              {status === "LIVE" && (
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 font-bold tracking-widest uppercase">Day 2</span>
                  <span className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 font-bold tracking-widest uppercase">Sprint 300M</span>
                </div>
              )}
            </div>
            <Link href={LINKS.liveRace} className="group inline-flex items-center gap-3 rounded-2xl bg-white text-black hover:bg-white/90 px-7 py-5 font-bold tracking-widest text-sm uppercase transition self-start lg:self-center">
              {t.raceControl.viewLive}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   11. SCHEDULE
   ============================================================ */
function Schedule() {
  const { lang, t } = useLang();
  return (
    <section id="schedule" className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-12 lg:mb-16">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.schedule.heading}</h2>
          <p className="mt-3 text-white/60 text-lg max-w-xl">{t.schedule.sub}</p>
        </div>

        <div className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#A5B4FC] mb-5">{t.schedule.pre}</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PRE_RACE.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"
              >
                <p className="font-display italic text-3xl text-[#FCD34D]">{p.date}</p>
                <p className="mt-2 text-sm font-semibold text-white/85">{p.label[lang]}</p>
                {p.time && (
                  <p className="mt-1 text-xs text-white/50 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> {p.time}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {SCHEDULE.map((day, i) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, delay: i * 0.05 }}
              className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10 border-t border-white/10 pt-6 lg:pt-8"
            >
              <div>
                <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#67E8F9]">{day.label[lang]}</p>
                <p className="mt-2 font-display italic text-5xl lg:text-6xl leading-none">{day.date}</p>
                <p className="text-xs tracking-[0.25em] uppercase text-white/40 mt-1">{day.dateLabel}</p>
                <p className="mt-3 text-xs tracking-widest text-white/60 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> {day.time}
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {day.events.map((ev) => (
                  <div key={ev.en} className="rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition px-4 py-4 text-sm font-semibold text-white/85">
                    {ev[lang]}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   12. RACE CATEGORIES
   ============================================================ */
function Categories() {
  const { lang, t } = useLang();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 lg:mb-14">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.categories.heading}</h2>
          <p className="mt-3 text-white/60 text-lg">{t.categories.sub}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 lg:gap-4">
          {RACE_CATEGORIES.map((c, i) => {
            const Icon = ICONS[c.icon] ?? Zap;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.05] hover:border-white/20 transition cursor-default"
              >
                <div className="w-11 h-11 rounded-xl grid place-items-center mb-4 transition-transform group-hover:-rotate-6" style={{ background: `${c.accent}25`, color: c.accent }}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-display italic text-2xl lg:text-3xl leading-none">{c.name}</p>
                <p className="mt-2 text-xs text-white/55">{c.description[lang]}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   13. REGISTERED CLUBS + MODAL
   ============================================================ */
const PAGE_SIZE = 10;

function Clubs() {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Club | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? REGISTERED_CLUBS.filter((c) => c.name.toLowerCase().includes(s)) : REGISTERED_CLUBS;
  }, [q]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <section id="clubs" className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.clubs.heading}</h2>
            <p className="mt-3 text-white/60 text-lg">
              <span className="text-white font-bold">{EVENT_STATS[0].value}</span> {t.clubs.sub}
            </p>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text" value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder={t.clubs.search}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3.5 text-sm placeholder-white/30 focus:outline-none focus:border-[#3B82F6] focus:bg-white/[0.05] transition"
            />
          </div>
        </div>

        <div className="hidden lg:block overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03]">
              <tr className="text-left text-[11px] tracking-[0.2em] uppercase text-white/50">
                <th className="px-5 py-4 w-16">{t.clubs.no}</th>
                <th className="px-5 py-4">{t.clubs.club}</th>
                <th className="px-5 py-4 w-32">{t.clubs.athletes}</th>
                <th className="px-5 py-4 w-40">{t.clubs.status}</th>
                <th className="px-5 py-4 w-12" />
              </tr>
            </thead>
            <tbody>
              {visible.map((c, i) => (
                <tr key={c.id} onClick={() => setSelected(c)} className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition">
                  <td className="px-5 py-4 text-white/40 font-mono">{String(i + 1).padStart(2, "0")}</td>
                  <td className="px-5 py-4 font-semibold">{c.name}</td>
                  <td className="px-5 py-4 text-white/70">
                    <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {c.athletes}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981]/15 text-[#6EE7B7] px-2.5 py-1 text-[11px] font-bold tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
                      {t.clubs.registered}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30"><ChevronRight className="w-4 h-4" /></td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-white/40">{t.clubs.noResults}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-3">
          {visible.map((c, i) => (
            <button key={c.id} onClick={() => setSelected(c)} className="w-full flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left active:bg-white/[0.05] transition">
              <span className="font-mono text-xs text-white/40 w-6">{String(i + 1).padStart(2, "0")}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-semibold truncate">{c.name}</span>
                <span className="mt-1 flex items-center gap-3 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> {c.athletes}</span>
                  <span className="inline-flex items-center gap-1 text-[#6EE7B7]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" /> {t.clubs.registered}
                  </span>
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-white/40 text-sm">{t.clubs.noResults}</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-white/40 tracking-wider">
            {t.clubs.showing} <span className="text-white/70">{visible.length}</span> {t.clubs.of} <span className="text-white/70">{filtered.length}</span>
          </p>
          {hasMore && (
            <button onClick={() => setPage((p) => p + 1)} className="rounded-xl border border-white/15 hover:bg-white/5 px-5 py-2.5 text-[11px] font-bold tracking-widest uppercase transition">
              {t.clubs.loadMore}
            </button>
          )}
        </div>
      </div>

      <ClubModal club={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

function ClubModal({ club, onClose }: { club: Club | null; onClose: () => void }) {
  const { t } = useLang();
  const open = club !== null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && club && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label={club.name}
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#0B0D14] p-6 sm:p-8 max-h-[85vh] sm:max-h-none overflow-y-auto"
          >
            <button
              onClick={onClose}
              aria-label={t.modal.close}
              className="absolute right-4 top-4 w-9 h-9 grid place-items-center rounded-lg hover:bg-white/5 border border-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#A5B4FC] mb-3">Club Profile</p>
            <h3 className="font-display italic text-4xl leading-none pr-10">{club.name}</h3>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <Users className="w-5 h-5 text-[#67E8F9] mb-3" />
                <p className="font-display italic text-3xl leading-none">{club.athletes}</p>
                <p className="mt-1 text-[10px] tracking-widest uppercase text-white/50">{t.modal.athletes}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <CheckCircle2 className="w-5 h-5 text-[#6EE7B7] mb-3" />
                <p className="font-display italic text-3xl leading-none text-[#6EE7B7]">OK</p>
                <p className="mt-1 text-[10px] tracking-widest uppercase text-white/50">{t.modal.status}</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-white/50 leading-relaxed">{t.modal.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   14. AWARDS
   ============================================================ */
function Awards() {
  const { t } = useLang();
  const cards = [
    { key: "overall", title: t.awards.overall, desc: t.awards.overallDesc, Icon: Trophy, color: "#FCD34D", href: "/championship" },
    { key: "mvp", title: t.awards.mvp, desc: t.awards.mvpDesc, Icon: Star, color: "#C4B5FD", href: "/championship#mvp" },
  ];
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 lg:mb-14">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.awards.heading}</h2>
          <p className="mt-3 text-white/60 text-lg max-w-xl">{t.awards.sub}</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-5">
          {cards.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
            >
              <Link href={c.href} className="group block relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-8 lg:p-10 hover:border-white/20 transition">
                <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full blur-[100px] opacity-25 group-hover:opacity-40 transition" style={{ background: c.color }} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl grid place-items-center mb-6" style={{ background: `${c.color}25`, color: c.color }}>
                    <c.Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display italic text-4xl lg:text-5xl leading-none">{c.title}</h3>
                  <p className="mt-4 text-white/60 max-w-sm">{c.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/championship" className="group inline-flex items-center gap-3 rounded-xl border border-white/15 hover:bg-white/5 px-6 py-4 font-bold tracking-widest text-[13px] uppercase transition">
            {t.awards.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   15. LIVE STREAM
   ============================================================ */
function LiveStream() {
  const { t } = useLang();
  const isLive = getEventStatus() === "LIVE";
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.stream.heading}</h2>
            <p className="mt-4 text-white/60 text-lg max-w-md">{t.stream.sub}</p>
            <a
              href={LINKS.liveStream} target="_blank" rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] px-7 py-4 font-bold tracking-widest text-[13px] uppercase transition shadow-lg shadow-red-600/25"
            >
              <Play className="w-4 h-4 fill-current" />
              {t.stream.cta}
            </a>
          </div>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0B0D14] to-[#1a1a1a] grid place-items-center">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 grid place-items-center mb-4">
                <Play className="w-8 h-8 ml-1 fill-white/80" />
              </div>
              <p className="text-sm text-white/60">{t.stream.placeholder}</p>
            </div>
            {isLive && (
              <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-[#EF4444] px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase">
                <Radio className="w-3 h-3" /> {t.stream.live}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   16. EVENT DOCUMENTS
   ============================================================ */
function Documents() {
  const { t } = useLang();
  const docs = [
    { key: "athlete", title: t.docs.athleteTitle, desc: t.docs.athleteDesc, cta: t.docs.athleteCta, href: LINKS.athleteBookPdf, Icon: BookOpen, color: "#FCD34D" },
    { key: "race", title: t.docs.raceTitle, desc: t.docs.raceDesc, cta: t.docs.raceCta, href: LINKS.raceBookPdf, Icon: BookMarked, color: "#67E8F9" },
  ];
  return (
    <section id="documents" className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 lg:mb-14">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.docs.heading}</h2>
          <p className="mt-3 text-white/60 text-lg">{t.docs.sub}</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-5">
          {docs.map((d) => (
            <a
              key={d.key} href={d.href} target="_blank" rel="noopener noreferrer"
              className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] p-7 lg:p-8 min-h-[240px] transition"
            >
              <div className="w-14 h-14 rounded-2xl grid place-items-center mb-6 transition-transform group-hover:-rotate-6" style={{ background: `${d.color}25`, color: d.color }}>
                <d.Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display italic text-4xl leading-none">{d.title}</h3>
                <p className="mt-3 text-sm text-white/60">{d.desc}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase" style={{ color: d.color }}>
                {d.cta}
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
              </div>
            </a>
          ))}
          <a
            href={LINKS.thbPdf} target="_blank" rel="noopener noreferrer"
            className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F3D2E] to-[#0B0D14] p-7 lg:p-8 min-h-[240px] transition hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl grid place-items-center mb-6 bg-[#10B981]/25 text-[#6EE7B7] transition-transform group-hover:-rotate-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#6EE7B7] mb-2">THB</p>
              <h3 className="font-display italic text-4xl leading-none">{t.docs.thbTitle}</h3>
              <p className="mt-3 text-sm text-white/60">{t.docs.thbDesc}</p>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#6EE7B7]">
              {t.docs.thbCta}
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   17. CERTIFICATE
   ============================================================ */
function Certificate() {
  const { t } = useLang();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#0A2E38] via-[#0B0D14] to-[#0B0D14] p-8 lg:p-14 grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#22D3EE] opacity-20 blur-[120px]" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl grid place-items-center mb-6 bg-[#22D3EE]/25 text-[#67E8F9]">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">{t.cert.heading}</h2>
            <p className="mt-4 text-white/70 text-lg max-w-md">{t.cert.sub}</p>
          </div>
          <Link
            href={LINKS.eCertificate}
            className="group relative inline-flex items-center gap-3 rounded-xl bg-[#22D3EE] text-black hover:bg-[#06B6D4] px-7 py-5 font-bold tracking-widest text-[13px] uppercase transition self-start lg:self-center"
          >
            {t.cert.cta}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   18. SOCIAL / COMMUNITY
   ============================================================ */
function Social() {
  const { t } = useLang();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
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
   19. LOCATION
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
   20. FAQ
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
   21. FOOTER
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
            <p className="font-display italic text-6xl leading-none">SQRL</p>
            <p className="mt-4 text-white/60">{t.footer.tagline}</p>
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
   22. PAGE
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
        <Status />
        <Stats />
        <Hub />
        <LiveRace />
        <Schedule />
        <Categories />
        <Clubs />
        <Awards />
        <LiveStream />
        <Documents />
        <Certificate />
        <Social />
        <Location />
        <FAQ />
        <Footer />
      </main>
    </LangCtx.Provider>
  );
}