// src/pages/payment/success/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Building2,
  Home,
  MapPin,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  ArrowRight,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  AlertCircle,
  Download,
  Printer,
  Copy,
  Sparkles,
  MessageCircle,
  Menu,
  Star,
  Clock as ClockIcon,
  Check,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Timestamp } from 'firebase/firestore';

// ========== TYPES ==========
interface BookingDetail {
  id: string;
  propertyID: string;
  managementID: string;
  source: string;
  status: string;
  publicCustomerName: string;
  publicCustomerEmail: string;
  publicCustomerPhone: string;
  notes?: string;
  paymentProofUrl?: string;
  totalPrice: number;
  adminFee: number;
  totalWithFee: number;
  totalNights: number;
  checkInDate?: Timestamp | Date;
  checkOutDate?: Timestamp | Date;
  createdAt: Timestamp | Date;
  propertyName?: string;
  propertyUnit?: string;
  propertyCity?: string;
  propertyCountry?: string;
  managementName?: string;
  managementBrandColor?: string;
  originalCheckIn?: Timestamp | Date;
  isLateNightBooking?: boolean;
  managementContact?: string;
}

type Language = 'id' | 'en';

// ========== TRANSLATIONS ==========
const translations = {
  id: {
    title: 'Pembayaran Berhasil!',
    subtitle: 'Pembayaran Anda telah kami terima',
    bookingId: 'ID Booking',
    thankYou: 'Terima kasih telah melakukan pembayaran!',
    waitingConfirmation: 'Pembayaran Anda sedang menunggu konfirmasi dari manajemen properti.',
    estimatedTime: 'Proses verifikasi maksimal 1x24 jam',
    bookingDetails: 'Detail Pemesanan',
    property: 'Properti',
    unit: 'Unit',
    location: 'Lokasi',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Malam',
    totalPrice: 'Total Harga',
    adminFee: 'Biaya Admin',
    totalPayment: 'Total Pembayaran',
    customerInfo: 'Informasi Pemesan',
    name: 'Nama',
    email: 'Email',
    phone: 'Telepon/WA',
    notes: 'Catatan',
    nextSteps: 'Langkah Selanjutnya',
    step1: 'Tunggu konfirmasi dari manajemen properti',
    step2: 'Cek email Anda untuk notifikasi',
    step3: 'Siapkan diri untuk check-in',
    contactManagement: 'Hubungi Manajemen via WhatsApp',
    backToHome: 'Kembali ke Beranda',
    viewProperties: 'Lihat Properti Lain',
    shareBooking: 'Bagikan Booking',
    downloadReceipt: 'Download Bukti',
    printReceipt: 'Cetak Bukti',
    copyId: 'Salin ID Booking',
    copied: 'Tersalin!',
    errorFetch: 'Gagal memuat detail pembayaran',
    notFound: 'Data tidak ditemukan',
    retry: 'Coba Lagi',
    loading: 'Memuat...',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    language: 'Bahasa',
    managementWillContact: 'Manajemen akan menghubungi Anda melalui WhatsApp/Email',
    success: 'Pembayaran Berhasil',
    checkEmail: 'Cek email Anda untuk detail pemesanan',
    viaWhatsApp: 'Via WhatsApp',
    viaEmail: 'Via Email',
    home: 'Beranda',
    properties: 'Properti',
    contact: 'Kontak',
    rating: 'ulasan',
    lateNightBooking: 'Booking Tengah Malam',
    lateNightInfo: 'Tanggal asli: {original} → Disesuaikan menjadi {adjusted} (H-1)',
    noContact: 'Nomor kontak manajemen tidak tersedia',
    contactManagementDesc: 'Hubungi manajemen untuk konfirmasi atau pertanyaan:',
    whatsappMessage: `Halo, saya *{customer}* ingin mengkonfirmasi booking saya:%0A%0A📋 *ID Booking:* {bookingId}%0A🏠 *Properti:* {property}%0A📅 *Check-in:* {checkIn}%0A📅 *Check-out:* {checkOut}%0A💰 *Total:* {total}%0A%0ATerima kasih.`,
  },
  en: {
    title: 'Payment Successful!',
    subtitle: 'Your payment has been received',
    bookingId: 'Booking ID',
    thankYou: 'Thank you for your payment!',
    waitingConfirmation: 'Your payment is waiting for management confirmation.',
    estimatedTime: 'Verification process maximum 1x24 hours',
    bookingDetails: 'Booking Details',
    property: 'Property',
    unit: 'Unit',
    location: 'Location',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Nights',
    totalPrice: 'Total Price',
    adminFee: 'Admin Fee',
    totalPayment: 'Total Payment',
    customerInfo: 'Customer Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone/WA',
    notes: 'Notes',
    nextSteps: 'Next Steps',
    step1: 'Wait for management confirmation',
    step2: 'Check your email for notifications',
    step3: 'Prepare for check-in',
    contactManagement: 'Contact Management via WhatsApp',
    backToHome: 'Back to Home',
    viewProperties: 'View Other Properties',
    shareBooking: 'Share Booking',
    downloadReceipt: 'Download Receipt',
    printReceipt: 'Print Receipt',
    copyId: 'Copy Booking ID',
    copied: 'Copied!',
    errorFetch: 'Failed to load payment details',
    notFound: 'Data not found',
    retry: 'Retry',
    loading: 'Loading...',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    managementWillContact: 'Management will contact you via WhatsApp/Email',
    success: 'Payment Successful',
    checkEmail: 'Check your email for booking details',
    viaWhatsApp: 'Via WhatsApp',
    viaEmail: 'Via Email',
    home: 'Home',
    properties: 'Properties',
    contact: 'Contact',
    rating: 'reviews',
    lateNightBooking: 'Late Night Booking',
    lateNightInfo: 'Original date: {original} → Adjusted to {adjusted} (previous day)',
    noContact: 'Management contact number not available',
    contactManagementDesc: 'Contact management for confirmation or questions:',
    whatsappMessage: `Hello, I am *{customer}* and I want to confirm my booking:%0A%0A📋 *Booking ID:* {bookingId}%0A🏠 *Property:* {property}%0A📅 *Check-in:* {checkIn}%0A📅 *Check-out:* {checkOut}%0A💰 *Total:* {total}%0A%0AThank you.`,
  }
};

// ========== MAIN COMPONENT ==========
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  // ========== STATE ==========
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ========== UI ==========
  const [language, setLanguage] = useState<Language>('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  // ========== DARK MODE ==========
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setIsDarkMode(savedTheme === 'dark');
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // ========== LANGUAGE ==========
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language') as Language | null;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) setLanguage(savedLang);
    else setLanguage('id');
  }, []);

  useEffect(() => {
    localStorage.setItem('preferred_language', language);
  }, [language]);

  // ========== SCROLL DETECTION ==========
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========== FETCH BOOKING ==========
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Booking ID is required');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const bookingDoc = await getDoc(doc(db, 'bookings', bookingId));
        if (!bookingDoc.exists()) {
          setError(t.notFound);
          setLoading(false);
          return;
        }

        const data = bookingDoc.data();

        let propertyName = 'Property';
        let propertyUnit = '';
        let propertyCity = '';
        let propertyCountry = 'Indonesia';
        let managementName = 'Management';
        let managementBrandColor = '#21409A';
        let managementContact = '';

        // Fetch property details
        if (data.propertyID) {
          const propDoc = await getDoc(doc(db, 'properties', data.propertyID));
          if (propDoc.exists()) {
            const propData = propDoc.data();
            propertyName = propData.name || 'Property';
            propertyUnit = propData.unitNumber || '';
            propertyCity = propData.city || '';
            propertyCountry = propData.country || 'Indonesia';
          }
        }

        // Fetch management (including contactInfo)
        if (data.managementID) {
          const mgmtDoc = await getDoc(doc(db, 'management', data.managementID));
          if (mgmtDoc.exists()) {
            const mgmtData = mgmtDoc.data();
            managementName = mgmtData.managementName || 'Management';
            managementBrandColor = mgmtData.brandColor || '#21409A';
            managementContact = mgmtData.contactInfo || '';
          }
        }

        const bookingDetail: BookingDetail = {
          id: bookingDoc.id,
          propertyID: data.propertyID,
          managementID: data.managementID,
          source: data.source || 'direct',
          status: data.status || 'pending_public',
          publicCustomerName: data.publicCustomerName || 'Guest',
          publicCustomerEmail: data.publicCustomerEmail || '',
          publicCustomerPhone: data.publicCustomerPhone || '',
          notes: data.notes || '',
          paymentProofUrl: data.paymentProofUrl || '',
          totalPrice: data.totalPrice || 0,
          adminFee: data.adminFee || 2500,
          totalWithFee: data.totalWithFee || 0,
          totalNights: data.totalNights || 0,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          createdAt: data.createdAt,
          propertyName: propertyName,
          propertyUnit: propertyUnit,
          propertyCity: propertyCity,
          propertyCountry: propertyCountry,
          managementName: managementName,
          managementBrandColor: managementBrandColor,
          originalCheckIn: data.originalCheckIn || null,
          isLateNightBooking: data.isLateNightBooking || false,
          managementContact: managementContact,
        };

        setBooking(bookingDetail);

      } catch (err) {
        console.error('Error fetching booking:', err);
        setError(t.errorFetch);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, t.notFound, t.errorFetch]);

  // ========== COPY BOOKING ID ==========
  const copyBookingId = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.id);
    setCopied(true);
    toast.success(t.copied);
    setTimeout(() => setCopied(false), 2000);
  };

  // ========== HANDLE PRINT ==========
  const handlePrint = () => {
    window.print();
  };

  // ========== HANDLE WHATSAPP CONTACT ==========
  const handleContactManagement = () => {
    if (!booking) return;
    const contact = booking.managementContact;
    if (!contact) {
      toast.warning(t.noContact);
      return;
    }

    let formattedPhone = contact.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('8')) {
      formattedPhone = '62' + formattedPhone;
    }

    const customerName = booking.publicCustomerName || 'Guest';
    const propertyName = booking.propertyName || 'Property';
    const checkIn = booking.checkInDate ? formatDate(booking.checkInDate) : '-';
    const checkOut = booking.checkOutDate ? formatDate(booking.checkOutDate) : '-';
    const total = formatCurrency(booking.totalWithFee);

    const message = t.whatsappMessage
      .replace('{customer}', customerName)
      .replace('{bookingId}', booking.id)
      .replace('{property}', propertyName)
      .replace('{checkIn}', checkIn)
      .replace('{checkOut}', checkOut)
      .replace('{total}', total);

    const url = `https://wa.me/${formattedPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  // ========== THEME (EXROOM - Urban Blue) ==========
  const bgDark = isDarkMode ? 'bg-[#081120]' : 'bg-[#F8FAFC]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#0F172A]';
  const textSecondary = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';
  const borderColor = isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]';
  const brandColor = booking?.managementBrandColor || '#21409A';

  // ========== FORMAT DATE ==========
  const formatDate = (timestamp: Timestamp | Date | undefined): string => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgDark}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ========== ERROR ==========
  if (error || !booking) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgDark} p-4`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Oops!</h1>
          <p className={`${textSecondary} mb-6`}>{error || t.notFound}</p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#21409A] text-white rounded-xl hover:bg-[#4F7DFF] transition-colors">
              <ArrowRight className="w-4 h-4" />
              {t.backToHome}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgDark} transition-colors duration-300 overflow-x-hidden`}>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="top-right" autoClose={3000} />

      {/* ========== NAVBAR (EXROOM) ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? `${isDarkMode ? 'bg-[#081120]/95' : 'bg-white/95'} backdrop-blur-md shadow-lg`
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#21409A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">EX</span>
              </div>
              <span className={`text-lg font-semibold tracking-tight ${textPrimary}`}>
                EXROOM
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className={`text-sm font-medium ${textPrimary} hover:text-[#4F7DFF] transition`}>
                {t.home}
              </Link>
              <Link href="/properties" className={`text-sm font-medium ${textPrimary} hover:text-[#4F7DFF] transition border-b-2 border-[#4F7DFF]`}>
                {t.properties}
              </Link>
              <a href="#contact" className={`text-sm font-medium ${textPrimary} hover:text-[#4F7DFF] transition`}>
                {t.contact}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition hover:bg-[#4F7DFF]/10`}
              >
                {isDarkMode ? (
                  <Sun className={`w-5 h-5 ${textPrimary}`} />
                ) : (
                  <Moon className={`w-5 h-5 ${textPrimary}`} />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`p-2 rounded-full transition flex items-center gap-1 hover:bg-[#4F7DFF]/10`}
                >
                  <Globe className={`w-5 h-5 ${textPrimary}`} />
                  <span className={`text-xs font-medium ${textPrimary}`}>
                    {language === 'id' ? 'ID' : 'EN'}
                  </span>
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full right-0 mt-2 w-40 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-xl shadow-xl overflow-hidden border ${borderColor} z-50`}
                    >
                      <button
                        onClick={() => { setLanguage('id'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2`}
                      >
                        🇮🇩 Indonesia {language === 'id' && <Check className="w-4 h-4 text-[#4F7DFF] ml-auto" />}
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2 border-t ${borderColor}`}
                      >
                        🇬🇧 English {language === 'en' && <Check className="w-4 h-4 text-[#4F7DFF] ml-auto" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-full transition hover:bg-[#4F7DFF]/10`}
              >
                <Menu className={`w-5 h-5 ${textPrimary}`} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`md:hidden ${isDarkMode ? 'bg-[#081120]' : 'bg-white'} border-t ${borderColor} p-6`}
            >
              <div className="flex flex-col space-y-4">
                <Link href="/" className={`text-sm tracking-widest uppercase ${textPrimary} hover:text-[#4F7DFF] transition`} onClick={() => setIsMobileMenuOpen(false)}>
                  {t.home}
                </Link>
                <Link href="/properties" className={`text-sm tracking-widest uppercase ${textPrimary} hover:text-[#4F7DFF] transition`} onClick={() => setIsMobileMenuOpen(false)}>
                  {t.properties}
                </Link>
                <a href="#contact" className={`text-sm tracking-widest uppercase ${textPrimary} hover:text-[#4F7DFF] transition`} onClick={() => setIsMobileMenuOpen(false)}>
                  {t.contact}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className={`${textSecondary} hover:text-[#4F7DFF] transition-colors`}>
            {t.home}
          </Link>
          <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
          <Link href="/properties" className={`${textSecondary} hover:text-[#4F7DFF] transition-colors`}>
            {t.properties}
          </Link>
          <ChevronRight className={`w-4 h-4 ${textSecondary}`} />
          <span className={textPrimary}>{t.success}</span>
        </div>

        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-500/20 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
          </div>

          <h1 className={`text-3xl md:text-4xl font-light ${textPrimary} tracking-tight mb-2`}>
            {t.success}
          </h1>
          <p className={`${textSecondary} text-lg font-light`}>
            {t.waitingConfirmation}
          </p>
          <div className={`inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-full ${isDarkMode ? 'bg-[#21409A]/20' : 'bg-[#4F7DFF]/10'} border border-[#4F7DFF]/20`}>
            <Clock className="w-4 h-4 text-[#4F7DFF]" />
            <span className={`text-sm ${textSecondary}`}>{t.estimatedTime}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ====== LEFT: DETAILS ====== */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking ID */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className={`text-sm ${textSecondary}`}>{t.bookingId}</p>
                  <p className={`text-xl font-mono font-bold ${textPrimary}`}>
                    {booking.id.slice(0, 12)}...
                  </p>
                </div>
                <button
                  onClick={copyBookingId}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[#4F7DFF] text-white hover:bg-[#21409A]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      {t.copied}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {t.copyId}
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Property & Customer Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
            >
              <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>{t.bookingDetails}</h2>

              <div className="space-y-4">
                {/* Property */}
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-[#4F7DFF] mt-0.5" />
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{t.property}</p>
                    <p className={`font-medium ${textPrimary}`}>{booking.propertyName}</p>
                    <p className={`text-sm ${textSecondary}`}>{t.unit} {booking.propertyUnit}</p>
                    <div className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                      <MapPin className="w-3 h-3" />
                      <span>{booking.propertyCity}, {booking.propertyCountry}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-[#4F7DFF] fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                      ))}
                      <span className={`text-xs ${textSecondary} ml-1`}>(4.8 {t.rating})</span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{t.checkIn}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formatDate(booking.checkInDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{t.checkOut}</p>
                    <p className={`font-medium ${textPrimary}`}>
                      {formatDate(booking.checkOutDate)}
                    </p>
                  </div>
                </div>

                {/* ========== LATE-NIGHT BADGE ========== */}
                {booking.isLateNightBooking && booking.originalCheckIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                  >
                    <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className={`text-sm font-medium ${textPrimary}`}>
                        {t.lateNightBooking}
                      </p>
                      <p className={`text-xs ${textSecondary}`}>
                        {t.lateNightInfo
                          .replace('{original}', formatDate(booking.originalCheckIn))
                          .replace('{adjusted}', formatDate(booking.checkInDate))}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Total */}
                <div className={`pt-4 mt-2 border-t ${borderColor}`}>
                  <div className="flex justify-between mb-1">
                    <span className={textSecondary}>{t.totalPrice}</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className={textSecondary}>{t.adminFee}</span>
                    <span className={`font-medium ${textPrimary}`}>
                      {formatCurrency(booking.adminFee)}
                    </span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                    <span className={`font-bold ${textPrimary}`}>{t.totalPayment}</span>
                    <span className={`text-lg font-bold text-[#4F7DFF]`}>
                      {formatCurrency(booking.totalWithFee)}
                    </span>
                  </div>
                  <p className={`text-xs ${textSecondary} mt-1 text-right`}>
                    {booking.totalNights} {t.nights}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Customer Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
            >
              <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>{t.customerInfo}</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[#4F7DFF]" />
                  <span className={textPrimary}>{booking.publicCustomerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[#4F7DFF]" />
                  <span className={textPrimary}>{booking.publicCustomerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#4F7DFF]" />
                  <span className={textPrimary}>{booking.publicCustomerPhone}</span>
                </div>
                {booking.notes && (
                  <div className="flex items-start gap-3">
                    <MessageCircle className="w-4 h-4 text-[#4F7DFF] mt-0.5" />
                    <span className={textPrimary}>{booking.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ====== RIGHT: ACTIONS ====== */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24">
              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <div className="w-12 h-1 bg-gradient-to-r from-[#21409A] to-[#4F7DFF] rounded-full mb-4" />
                <h3 className={`text-xl font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Sparkles className="w-5 h-5 text-[#4F7DFF]" />
                  {t.nextSteps}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#4F7DFF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#4F7DFF] text-sm font-bold">1</span>
                    </div>
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{t.step1}</p>
                      <p className={`text-xs ${textSecondary}`}>{t.managementWillContact}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#4F7DFF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#4F7DFF] text-sm font-bold">2</span>
                    </div>
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{t.step2}</p>
                      <p className={`text-xs ${textSecondary}`}>{t.checkEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#4F7DFF]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#4F7DFF] text-sm font-bold">3</span>
                    </div>
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{t.step3}</p>
                      <p className={`text-xs ${textSecondary}`}>Siapkan identitas dan bukti booking</p>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${borderColor} space-y-2`}>
                  {/* ========== TOMBOL HUBUNGI MANAJEMEN ========== */}
                  {booking.managementContact ? (
                    <button
                      onClick={handleContactManagement}
                      className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {t.contactManagement}
                    </button>
                  ) : (
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-100'} text-center`}>
                      <p className={`text-xs ${textSecondary}`}>{t.noContact}</p>
                    </div>
                  )}

                  <Link href={`/property/${booking.propertyID}`}>
                    <button
                      className="w-full py-2.5 rounded-xl text-white font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2"
                      style={{ backgroundColor: brandColor }}
                    >
                      <Building2 className="w-4 h-4" />
                      {t.viewProperties}
                    </button>
                  </Link>

                  <Link href="/">
                    <button className="w-full mt-2 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      {t.backToHome}
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-4 border ${borderColor} shadow-lg mt-6`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePrint}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${textSecondary}`}>{t.printReceipt}</span>
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Fitur download sedang dalam pengembangan');
                    }}
                    className="p-3 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm ${textSecondary}`}>{t.downloadReceipt}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== FOOTER (EXROOM) ========== */}
      <footer className={`border-t ${borderColor} py-6 px-6 lg:px-8 max-w-7xl mx-auto mt-8`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#21409A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">EX</span>
            </div>
            <span className={`text-sm font-light ${textPrimary}`}>EXROOM</span>
            <span className={`text-xs ${textSecondary} ml-2`}>Smart Urban Living</span>
          </div>
          <div className={`text-xs ${textSecondary} tracking-widest`}>
            © {new Date().getFullYear()} EXROOM. Hak Cipta Dilindungi.
          </div>
          <div className="flex gap-6">
            <Link href="#" className={`${textSecondary} hover:text-[#4F7DFF] transition text-xs uppercase tracking-widest`}>Privacy</Link>
            <Link href="#" className={`${textSecondary} hover:text-[#4F7DFF] transition text-xs uppercase tracking-widest`}>Terms</Link>
          </div>
        </div>
      </footer>

      {/* ========== GLOBAL STYLES ========== */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #4F7DFF;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #21409A;
        }
      `}</style>
    </div>
  );
}