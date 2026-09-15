import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

/* ============================================================
   TYPES
   ============================================================ */
type Language = "en" | "id";
type L10n = { en: string; id: string };

/* ============================================================
   DATA
   ============================================================ */
const LINKS = {
  instagram: "https://www.instagram.com/sqrl.makassar",
  whatsapp: "https://wa.me/6282345006270",
  email: "hello@sqrl.id",
  phone: "+62 823-4500-6270",
  maps: "https://maps.google.com/?q=Lapangan+Karebosi+Makassar",
  eventsPage: "/events",
  googleForm: "https://forms.gle/1ARC5m1Go4pogJPG8",
};

/* ============================================================
   INSTAGRAM ICON (SVG — lucide removed it)
   ============================================================ */
function InstagramIcon({
  className,
  strokeWidth = 2,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
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

const CONTACT_CARDS = [
  {
    id: "whatsapp",
    Icon: MessageCircle,
    color: "#6EE7B7",
    eyebrow: { en: "Fastest Response", id: "Respons Tercepat" } as L10n,
    title: { en: "WhatsApp Admin", id: "WhatsApp Admin" } as L10n,
    value: "+62 823-4500-6270",
    cta: { en: "Chat on WhatsApp", id: "Chat WhatsApp" } as L10n,
    href: LINKS.whatsapp,
    external: true,
  },
  {
    id: "instagram",
    Icon: InstagramIcon,
    color: "#FDBA74",
    eyebrow: { en: "Social", id: "Sosial" } as L10n,
    title: { en: "Instagram", id: "Instagram" } as L10n,
    value: "@sqrl.makassar",
    cta: { en: "Open Instagram", id: "Buka Instagram" } as L10n,
    href: LINKS.instagram,
    external: true,
  },
  {
    id: "email",
    Icon: Mail,
    color: "#A5B4FC",
    eyebrow: { en: "Official", id: "Resmi" } as L10n,
    title: { en: "Email", id: "Email" } as L10n,
    value: "hello@sqrl.id",
    cta: { en: "Send Email", id: "Kirim Email" } as L10n,
    href: `mailto:${LINKS.email}`,
    external: false,
  },
];

/* ============================================================
   I18N
   ============================================================ */
type Dict = {
  hero: { eyebrow: string; title: string; sub: string };
  contact: { heading: string; sub: string };
  admin: { heading: string; sub: string; hours: string; location: string };
  quick: { heading: string; sub: string };
  cta: { events: string; chat: string };
  footer: {
    tagline: string;
    copyright: string;
    links: { home: string; events: string; instagram: string; whatsapp: string };
  };
};

const DICT: Record<Language, Dict> = {
  en: {
    hero: {
      eyebrow: "Get In Touch",
      title: "Talk To Us",
      sub: "Whether you're an athlete, coach, parent, or partner — our team is here to help.",
    },
    contact: {
      heading: "Contact Channels",
      sub: "Pick the channel that suits you best.",
    },
    admin: {
      heading: "Event Admin",
      sub: "For registration issues, payment confirmation, and race-day questions.",
      hours: "Mon – Sat · 09:00 – 21:00 WITA",
      location: "Makassar, South Sulawesi",
    },
    quick: {
      heading: "Quick Links",
      sub: "Everything you might need at your fingertips.",
    },
    cta: { events: "Back to Event Hub", chat: "Start Chat" },
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
    hero: {
      eyebrow: "Hubungi Kami",
      title: "Bicara Dengan Kami",
      sub: "Baik kamu atlet, coach, orang tua, atau partner — tim kami siap membantu.",
    },
    contact: {
      heading: "Kanal Kontak",
      sub: "Pilih kanal yang paling nyaman untukmu.",
    },
    admin: {
      heading: "Admin Event",
      sub: "Untuk pertanyaan pendaftaran, konfirmasi pembayaran, dan hal teknis hari lomba.",
      hours: "Sen – Sab · 09:00 – 21:00 WITA",
      location: "Makassar, Sulawesi Selatan",
    },
    quick: {
      heading: "Link Cepat",
      sub: "Semua yang mungkin kamu butuhkan, di ujung jari.",
    },
    cta: { events: "Kembali ke Event Hub", chat: "Mulai Chat" },
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
   HERO
   ============================================================ */
function Hero({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <section className="relative overflow-hidden border-b border-white/5 pt-16 lg:pt-20">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#2563EB]/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-0 w-[500px] h-[500px] rounded-full bg-[#F97316]/10 blur-[140px]" />

      <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4 mb-6"
        >
          <span className="h-[1px] w-10 bg-[#A5B4FC]/60" />
          <p className="text-[11px] font-bold tracking-[0.35em] uppercase text-[#A5B4FC]">
            {t.hero.eyebrow}
          </p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: reduce ? 0 : 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display italic leading-[0.9] tracking-tight text-white text-[16vw] sm:text-[12vw] lg:text-[9vw] xl:text-[120px]"
        >
          {t.hero.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-2xl text-white/70 text-base lg:text-lg leading-relaxed"
        >
          {t.hero.sub}
        </motion.p>
      </div>
    </section>
  );
}

/* ============================================================
   CONTACT GRID
   ============================================================ */
function ContactGrid({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 lg:mb-14">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
            {t.contact.heading}
          </h2>
          <p className="mt-3 text-white/60 text-lg">{t.contact.sub}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {CONTACT_CARDS.map((card, i) => {
            const extra = card.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <a
                  href={card.href}
                  {...extra}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-7 lg:p-8 min-h-[260px] flex flex-col justify-between hover:border-white/20 transition"
                >
                  <div
                    className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition"
                    style={{ background: card.color }}
                  />
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-2xl grid place-items-center mb-6 transition-transform group-hover:-rotate-6"
                      style={{ background: `${card.color}25`, color: card.color }}
                    >
                      <card.Icon className="w-6 h-6" strokeWidth={2.2} />
                    </div>
                    <p
                      className="text-[10px] font-bold tracking-[0.3em] uppercase mb-2"
                      style={{ color: card.color }}
                    >
                      {card.eyebrow.en}
                    </p>
                  </div>
                  <div className="relative">
                    <h3 className="font-display italic text-3xl lg:text-4xl leading-none">
                      {card.title.en}
                    </h3>
                    <p className="mt-3 text-white/70 text-sm break-all">
                      {card.value}
                    </p>
                    <div
                      className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase"
                      style={{ color: card.color }}
                    >
                      {card.cta.en}
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ADMIN + LOCATION
   ============================================================ */
function AdminLocation({ t }: { t: Dict }) {
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
                Admin
              </p>
              <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
                {t.admin.heading}
              </h2>
              <p className="mt-4 text-white/60 text-base lg:text-lg max-w-md">
                {t.admin.sub}
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#6EE7B7]/20 text-[#6EE7B7] grid place-items-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{LINKS.phone}</p>
                    <p className="text-white/60 text-sm mt-1">{t.admin.hours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F97316]/20 text-[#FDBA74] grid place-items-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Lapangan Karebosi</p>
                    <p className="text-white/60 text-sm mt-1">{t.admin.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#A5B4FC]/20 text-[#A5B4FC] grid place-items-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">WITA (UTC+8)</p>
                    <p className="text-white/60 text-sm mt-1">{t.admin.hours}</p>
                  </div>
                </div>
              </div>

              <a
                href={LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-10 inline-flex items-center gap-3 rounded-xl bg-[#22C55E] hover:bg-[#16A34A] px-6 py-4 font-bold tracking-widest text-[13px] uppercase text-black transition self-start shadow-xl shadow-green-500/25"
              >
                <MessageCircle className="w-4 h-4" />
                {t.cta.chat}
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
              <a
                href={LINKS.maps}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-6 left-6 right-6 inline-flex items-center gap-3 rounded-xl bg-black/60 backdrop-blur border border-white/10 hover:border-white/20 px-4 py-3 transition"
              >
                <Navigation className="w-4 h-4 text-[#FDBA74] shrink-0" />
                <p className="text-xs text-white/80 tracking-wide truncate flex-1">
                  Lapangan Karebosi, Makassar
                </p>
                <ArrowUpRight className="w-4 h-4 text-white/40" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   QUICK LINKS
   ============================================================ */
function QuickLinks({ t }: { t: Dict }) {
  const reduce = useReducedMotion();
  const items = [
    { label: { en: "Event Hub", id: "Event Hub" } as L10n, href: "/events" },
    {
      label: { en: "Register (Google Form)", id: "Daftar (Google Form)" } as L10n,
      href: LINKS.googleForm,
      external: true,
    },
    { label: { en: "Latest News", id: "Berita Terbaru" } as L10n, href: "/news" },
    { label: { en: "Instagram", id: "Instagram" } as L10n, href: LINKS.instagram, external: true },
  ];

  return (
    <section className="border-b border-white/5 py-16 lg:py-24">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="mb-10 lg:mb-14">
          <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
            {t.quick.heading}
          </h2>
          <p className="mt-3 text-white/60 text-lg">{t.quick.sub}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const extra = item.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {};
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: reduce ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <a
                  href={item.href}
                  {...extra}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-5 lg:p-6 transition"
                >
                  <span className="font-display italic text-xl lg:text-2xl leading-none">
                    {item.label.en}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer({ t }: { t: Dict }) {
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
          <nav className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 gap-y-3 text-sm self-start lg:self-end">
            <Link href="/" className="text-white/60 hover:text-white transition">
              {t.footer.links.home}
            </Link>
            <Link href="/events" className="text-white/60 hover:text-white transition">
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
   PAGE
   ============================================================ */
export default function ContactPage() {
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
        <title>Contact | EIRC 2026 — SQRL Makassar</title>
        <meta
          name="description"
          content="Get in touch with the SQRL team for EIRC 2026. WhatsApp, Instagram, and email."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#06070B] text-white overflow-x-hidden font-body">
        <SiteHeader
          lang={lang}
          setLang={setLang}
          currentPath="/contact"
          variant="events"
          googleFormUrl={LINKS.googleForm}
        />

        <main>
          <Hero t={t} />
          <ContactGrid t={t} />
          <AdminLocation t={t} />
          <QuickLinks t={t} />
        </main>

        <Footer t={t} />
      </div>
    </>
  );
}