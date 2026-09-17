import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, Tag } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";

/* ============================================================
   TYPES
   ============================================================ */
type Language = "en" | "id";
type L10n = { en: string; id: string };

interface NewsItem {
  id: string;
  slug: string;
  date: string;
  category: L10n;
  title: L10n;
  excerpt: L10n;
  image: string;
  featured?: boolean;
  href: string;
}

/* ============================================================
   DATA
   ============================================================ */
const NEWS: NewsItem[] = [
  {
    id: "n1",
    slug: "eirc-2026-registration-open",
    date: "2026-08-15",
    category: { en: "Announcement", id: "Pengumuman" },
    title: {
      en: "EIRC 2026 Registration Is Now Open",
      id: "Pendaftaran EIRC 2026 Resmi Dibuka",
    },
    excerpt: {
      en: "Early-bird registration for the Eastern Indonesia Inline Race Championship is live. Secure your slot through the official form.",
      id: "Pendaftaran early-bird untuk Eastern Indonesia Inline Race Championship sudah dibuka. Amankan slotmu melalui form resmi.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    featured: true,
    href: "/events",
  },
  {
    id: "n2",
    slug: "venue-announcement-karebosi",
    date: "2026-08-10",
    category: { en: "Event", id: "Event" },
    title: {
      en: "Venue Confirmed: Lapangan Karebosi, Makassar",
      id: "Venue Dikonfirmasi: Lapangan Karebosi, Makassar",
    },
    excerpt: {
      en: "The iconic Karebosi Field in the heart of Makassar will host all three days of racing.",
      id: "Lapangan Karebosi yang ikonik di jantung Kota Makassar akan menjadi tuan rumah tiga hari perlombaan.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    href: "/events",
  },
  {
    id: "n3",
    slug: "technical-handbook-released",
    date: "2026-08-05",
    category: { en: "Technical", id: "Teknis" },
    title: {
      en: "Technical Handbook 2026 Released",
      id: "Technical Handbook 2026 Telah Dirilis",
    },
    excerpt: {
      en: "Read the full regulations, category breakdown, and race-day procedures in the official THB.",
      id: "Baca peraturan lengkap, rincian kategori, dan prosedur hari lomba di THB resmi.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    href: "/events",
  },
  {
    id: "n4",
    slug: "sponsor-and-partner-announcement",
    date: "2026-07-28",
    category: { en: "Partnership", id: "Kemitraan" },
    title: {
      en: "SQRL Welcomes New Sponsors for EIRC 2026",
      id: "SQRL Sambut Sponsor Baru untuk EIRC 2026",
    },
    excerpt: {
      en: "A growing list of brands and communities are backing the eastern region's biggest inline race weekend.",
      id: "Semakin banyak brand dan komunitas yang mendukung race weekend inline terbesar di Indonesia Timur.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    href: "/events",
  },
  {
    id: "n5",
    slug: "athlete-preparation-tips",
    date: "2026-07-20",
    category: { en: "Tips", id: "Tips" },
    title: {
      en: "5 Preparation Tips Before Race Weekend",
      id: "5 Tips Persiapan Sebelum Race Weekend",
    },
    excerpt: {
      en: "From tapering to gear checks — how to arrive on race day at your peak.",
      id: "Dari tapering hingga pengecekan gear — cara datang di hari lomba dalam kondisi terbaik.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    href: "/events",
  },
  {
    id: "n6",
    slug: "volunteer-recruitment",
    date: "2026-07-12",
    category: { en: "Community", id: "Komunitas" },
    title: {
      en: "Volunteer Recruitment Now Open",
      id: "Rekrutmen Volunteer Dibuka",
    },
    excerpt: {
      en: "Be part of the race crew. Volunteers get exclusive access, a kit, and behind-the-scenes experience.",
      id: "Jadi bagian dari race crew. Volunteer dapat akses eksklusif, kit, dan pengalaman di balik layar.",
    },
    image: "/images/eirc-2026-artwork.jpg",
    href: "/events",
  },
];

/* ============================================================
   I18N
   ============================================================ */
type Dict = {
  hero: { eyebrow: string; title: string; sub: string };
  list: { heading: string; sub: string; readMore: string; featured: string; empty: string };
  cta: { events: string };
  footer: { tagline: string; copyright: string; links: { home: string; events: string; instagram: string; whatsapp: string } };
};

const LINKS = {
  eventsPage: "/events",
  instagram: "https://www.instagram.com/sqrl.makassar",
  whatsapp: "https://wa.me/6282345006270",
};

const DICT: Record<Language, Dict> = {
  en: {
    hero: {
      eyebrow: "Newsroom",
      title: "Latest Updates",
      sub: "Announcements, race news, and community stories from EIRC 2026.",
    },
    list: {
      heading: "All Stories",
      sub: "Everything we've published about race weekend.",
      readMore: "Read More",
      featured: "Featured",
      empty: "No news yet. Check back soon.",
    },
    cta: { events: "Explore Event Hub" },
    footer: {
      tagline: "Precision on wheels. Pride from Makassar.",
      copyright: "© 2026 SQRL. ALL RIGHTS RESERVED.",
      links: { home: "Home", events: "Events", instagram: "Instagram", whatsapp: "WhatsApp" },
    },
  },
  id: {
    hero: {
      eyebrow: "Newsroom",
      title: "Update Terbaru",
      sub: "Pengumuman, berita lomba, dan cerita komunitas seputar EIRC 2026.",
    },
    list: {
      heading: "Semua Berita",
      sub: "Semua yang kami publikasikan seputar race weekend.",
      readMore: "Baca Selengkapnya",
      featured: "Unggulan",
      empty: "Belum ada berita. Cek lagi nanti.",
    },
    cta: { events: "Jelajahi Event Hub" },
    footer: {
      tagline: "Presisi di atas roda. Kebanggaan dari Makassar.",
      copyright: "© 2026 SQRL. HAK CIPTA DILINDUNGI.",
      links: { home: "Home", events: "Event", instagram: "Instagram", whatsapp: "WhatsApp" },
    },
  },
};

/* ============================================================
   HELPERS
   ============================================================ */
function formatDate(iso: string, lang: Language) {
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   INSTAGRAM ICON
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
          className="mt-6 max-w-xl text-white/70 text-base lg:text-lg leading-relaxed"
        >
          {t.hero.sub}
        </motion.p>
      </div>
    </section>
  );
}

/* ============================================================
   FEATURED NEWS
   ============================================================ */
function FeaturedCard({ item, lang, t }: { item: NewsItem; lang: Language; t: Dict }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Link
        href={item.href}
        className="group relative block overflow-hidden rounded-[28px] border border-white/10 hover:border-white/20 transition"
      >
        <div className="grid lg:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
            <Image
              src={item.image}
              alt={item.title[lang]}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070B]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0B0D14]" />

            <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-3 py-1.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-white">
                {t.list.featured}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-7 sm:p-9 lg:p-12 flex flex-col justify-center bg-[#0B0D14]">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-[#A5B4FC]">
                <Tag className="w-3 h-3" />
                {item.category[lang]}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] tracking-widest uppercase text-white/50">
                <Calendar className="w-3 h-3" />
                {formatDate(item.date, lang)}
              </span>
            </div>

            <h2 className="font-display italic text-3xl sm:text-4xl lg:text-5xl leading-[0.95]">
              {item.title[lang]}
            </h2>
            <p className="mt-4 text-white/60 leading-relaxed max-w-lg">
              {item.excerpt[lang]}
            </p>

            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase text-[#67E8F9]">
              {t.list.readMore}
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ============================================================
   NEWS CARD
   ============================================================ */
function NewsCard({ item, lang, t, index }: { item: NewsItem; lang: Language; t: Dict; index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
    >
      <Link
        href={item.href}
        className="group block relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition"
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={item.image}
            alt={item.title[lang]}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="p-6 lg:p-7">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#A5B4FC]">
              {item.category[lang]}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-white/40">
              {formatDate(item.date, lang)}
            </span>
          </div>

          <h3 className="font-display italic text-2xl lg:text-3xl leading-[1.05] min-h-[2.4em]">
            {item.title[lang]}
          </h3>
          <p className="mt-3 text-sm text-white/55 leading-relaxed line-clamp-3">
            {item.excerpt[lang]}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-[#67E8F9]">
            {t.list.readMore}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
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
            <Link href="/" className="text-white/60 hover:text-white transition">{t.footer.links.home}</Link>
            <Link href="/events" className="text-white/60 hover:text-white transition">{t.footer.links.events}</Link>
            <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">
              {t.footer.links.instagram}
            </a>
            <a href={LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition">
              {t.footer.links.whatsapp}
            </a>
          </nav>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-[11px] tracking-[0.25em] uppercase text-white/40">{t.footer.copyright}</p>
          <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition text-sm">
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
export default function NewsPage() {
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
  const featured = NEWS.find((n) => n.featured) ?? NEWS[0];
  const rest = NEWS.filter((n) => n.id !== featured.id);

  return (
    <>
      <Head>
        <title>News | EIRC 2026 — SQRL Makassar</title>
        <meta
          name="description"
          content="Latest news, announcements, and updates from EIRC 2026 — hosted by SQRL Makassar."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-[#06070B] text-white overflow-x-hidden font-body">
        <SiteHeader
          lang={lang}
          setLang={setLang}
          currentPath="/news"
          variant="events"
          googleFormUrl="https://forms.gle/1ARC5m1Go4pogJPG8"
        />

        <main>
          <Hero t={t} />

          {/* Featured */}
          <section className="border-b border-white/5 py-16 lg:py-20">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
              {featured && <FeaturedCard item={featured} lang={lang} t={t} />}
            </div>
          </section>

          {/* Grid */}
          <section className="border-b border-white/5 py-16 lg:py-24">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
              <div className="mb-10 lg:mb-14">
                <h2 className="font-display italic text-5xl sm:text-6xl lg:text-7xl leading-[0.9]">
                  {t.list.heading}
                </h2>
                <p className="mt-3 text-white/60 text-lg max-w-xl">{t.list.sub}</p>
              </div>

              {rest.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((item, i) => (
                    <NewsCard key={item.id} item={item} lang={lang} t={t} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm py-12 text-center">{t.list.empty}</p>
              )}
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 lg:py-20">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12 text-center">
              <Link
                href={LINKS.eventsPage}
                className="group inline-flex items-center gap-3 rounded-xl bg-white text-black hover:bg-white/90 px-7 py-4 font-bold tracking-widest text-[13px] uppercase transition"
              >
                {t.cta.events}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        </main>

        <Footer t={t} />
      </div>
    </>
  );
}