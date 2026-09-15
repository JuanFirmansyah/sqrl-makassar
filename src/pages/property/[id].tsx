// src/pages/property/[id].tsx
'use client';

import { useState, useEffect, useCallback, forwardRef, useRef } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Building2,
  MapPin,
  ArrowLeft,
  Calendar,
  Home,
  Bed,
  Bath,
  Wifi,
  Tv,
  Coffee,
  Car,
  Dumbbell,
  Sparkles,
  Shield,
  Star,
  X,
  Play,
  Loader2,
  AlertCircle,
  Check,
  Clock,
  Users,
  Maximize2,
  Sun,
  Moon,
  Globe,
  Menu,
  Tag,
  ArrowDown,
  CheckCircle,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays, differenceInDays } from 'date-fns';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ========== TYPES ==========
interface Property {
  id: string;
  name: string;
  city: string;
  country: string;
  price: number;
  directPrice?: number;
  photoURLs: string[];
  propertyType: string;
  roomType: string;
  floor: number;
  tower: string;
  unitNumber: string;
  availability: string;
  bedrooms?: number;
  bathrooms?: number;
  facilities?: string[];
  managementID?: string;
  managementName?: string;
  managementBrandColor?: string;
  description?: string;
  streetAddress?: string;
  guestAccommodation?: string;
  videoLink?: string;
  propertyLocationName?: string;
  agentDiscount?: number;
  directDiscount?: number;
}

type Language = 'id' | 'en';

// ========== TRANSLATIONS ==========
const translations = {
  id: {
    backToProperties: 'Kembali ke Residences',
    propertyDetail: 'Detail Residences',
    perNight: '/malam',
    bookNow: 'Pesan Sekarang',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectDate: 'Pilih tanggal',
    total: 'Total',
    nights: 'malam',
    facilities: 'Fasilitas',
    virtualTour: 'Virtual Tour',
    watchVideo: 'Tonton Video',
    location: 'Lokasi',
    floor: 'Lantai',
    guests: 'Tamu',
    bedrooms: 'Kamar Tidur',
    bathrooms: 'Kamar Mandi',
    type: 'Tipe',
    loading: 'Memuat...',
    errorFetch: 'Gagal memuat data',
    retry: 'Coba Lagi',
    available: 'Tersedia',
    occupied: 'Terisi',
    maintenance: 'Pemeliharaan',
    propertyUnavailable: 'Residences tidak tersedia untuk tanggal yang dipilih',
    dateBlocked: 'Tanggal ini diblokir oleh manajemen',
    bookingWindowWarning: 'Booking hanya bisa untuk {days} hari ke depan',
    invalidDates: 'Tanggal tidak valid. Check-out harus setelah check-in.',
    propertyAlreadyBooked: 'Residences sudah dipesan untuk tanggal ini',
    selectCheckIn: 'Pilih Check-in',
    selectCheckOut: 'Pilih Check-out',
    bookingWindowTitle: 'Pembatasan Tanggal Booking',
    maxDateInfo: 'Maksimal tanggal check-in: {date}',
    rating: 'ulasan',
    home: 'Beranda',
    properties: 'Residences',
    contact: 'Kontak',
    specialPrice: 'Harga Khusus',
    saturdayPrice: 'Harga Sabtu',
    normalPrice: 'Harga Normal',
    priceIncludesDiscount: 'Termasuk diskon {discount}%',
    lateNightBooking: 'Booking Tengah Malam',
    lateNightDesc: 'Anda melakukan booking pada jam {hour}:{minute}',
    originalDate: 'Tanggal yang Anda pilih:',
    actualDate: 'Akan diproses sebagai check-in:',
    lateNightInfo: 'Booking di atas jam 12 malam sampai jam 5 pagi otomatis dihitung sebagai check-in hari sebelumnya.',
    cancel: 'Batal',
    continueBooking: 'Lanjutkan Booking',
    lateNightBanner: 'Anda booking pada jam {hour}:{minute}. Check-in akan diproses sebagai {date} (hari sebelumnya).',
    share: 'Bagikan',
    save: 'Simpan',
  },
  en: {
    backToProperties: 'Back to Residences',
    propertyDetail: 'Residence Detail',
    perNight: '/night',
    bookNow: 'Book Now',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectDate: 'Select date',
    total: 'Total',
    nights: 'nights',
    facilities: 'Facilities',
    virtualTour: 'Virtual Tour',
    watchVideo: 'Watch Video',
    location: 'Location',
    floor: 'Floor',
    guests: 'Guests',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    type: 'Type',
    loading: 'Loading...',
    errorFetch: 'Failed to load data',
    retry: 'Retry',
    available: 'Available',
    occupied: 'Occupied',
    maintenance: 'Maintenance',
    propertyUnavailable: 'Residence is not available for selected dates',
    dateBlocked: 'This date is blocked by management',
    bookingWindowWarning: 'Bookings only allowed for the next {days} days',
    invalidDates: 'Invalid dates. Check-out must be after check-in.',
    propertyAlreadyBooked: 'This residence is already booked for these dates',
    selectCheckIn: 'Select Check-in',
    selectCheckOut: 'Select Check-out',
    bookingWindowTitle: 'Date Restriction',
    maxDateInfo: 'Maximum check-in date: {date}',
    rating: 'reviews',
    home: 'Home',
    properties: 'Residences',
    contact: 'Contact',
    specialPrice: 'Special Price',
    saturdayPrice: 'Saturday Price',
    normalPrice: 'Normal Price',
    priceIncludesDiscount: 'Includes {discount}% discount',
    lateNightBooking: 'Late Night Booking',
    lateNightDesc: 'You are booking at {hour}:{minute}',
    originalDate: 'Date you selected:',
    actualDate: 'Will be processed as check-in:',
    lateNightInfo: 'Bookings between 12 AM and 5 AM are automatically processed as check-in on the previous day.',
    cancel: 'Cancel',
    continueBooking: 'Continue Booking',
    lateNightBanner: 'You booked at {hour}:{minute}. Check-in will be processed as {date} (previous day).',
    share: 'Share',
    save: 'Save',
  }
};

// ========== CUSTOM DATE INPUT ==========
interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  isDarkMode?: boolean;
}

const CustomDateInput = forwardRef<HTMLButtonElement, CustomDateInputProps>(
  ({ value, onClick, placeholder, isDarkMode = false }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`w-full px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between text-sm
        ${isDarkMode 
          ? 'bg-[#1a1a2e]/80 border-[#2a2a4a] text-white hover:border-[#4F7DFF]' 
          : 'bg-white/80 border-gray-200 text-[#0F172A] hover:border-[#4F7DFF]'
        } backdrop-blur-sm shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center gap-2">
        <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-[#4F7DFF]' : 'text-[#4F7DFF]'}`} />
        <span className={value ? '' : 'opacity-50'}>
          {value || placeholder}
        </span>
      </div>
      <ChevronDown className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
    </button>
  )
);
CustomDateInput.displayName = 'CustomDateInput';

// ========== HELPER: LOCAL DATE STRING ==========
const getLocalDateStr = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date: Date | null): string => {
  if (!date) return '';
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// ========== MAIN COMPONENT ==========
export default function PropertyDetailPage() {
  const router = useRouter();

  // ========== STATE ==========
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Booking states
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [disabledDates, setDisabledDates] = useState<Date[]>([]);
  const [maxAllowedDate, setMaxAllowedDate] = useState<Date | null>(null);
  const [bookingWindowDays, setBookingWindowDays] = useState<number>(30);
  const [totalPrice, setTotalPrice] = useState(0);

  // Pricing config
  const [specialDatePricing, setSpecialDatePricing] = useState<Record<string, Record<string, Record<string, { agentPrice?: number; directPrice?: number; agentDiscount?: number; directDiscount?: number }>>>>({});
  const [saturdayPricingMode, setSaturdayPricingMode] = useState(false);
  const [saturdayPriceIncrease, setSaturdayPriceIncrease] = useState(0);

  // Late-night booking
  const [isLateNightBooking, setIsLateNightBooking] = useState<boolean>(false);
  const [lateNightInfo, setLateNightInfo] = useState<{
    originalDate: Date;
    actualDate: Date;
    hour: number;
    minute: number;
  } | null>(null);
  const [showLateNightConfirmModal, setShowLateNightConfirmModal] = useState<boolean>(false);
  const [pendingCheckInDate, setPendingCheckInDate] = useState<Date | null>(null);

  // UI
  const [language, setLanguage] = useState<Language>('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const t = translations[language];
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.2]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  // ========== LATE-NIGHT HELPERS ==========
  const LATE_NIGHT_CUTOFF_HOUR = 5;
  const isLateNightTimeNow = (): boolean => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 0 && hour < LATE_NIGHT_CUTOFF_HOUR;
  };
  const isTodayOrTomorrow = (date: Date): boolean => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return target.getTime() === today.getTime() || target.getTime() === tomorrow.getTime();
  };
  const shouldAdjustForLateNight = (selectedDate: Date): boolean => {
    return isLateNightTimeNow() && isTodayOrTomorrow(selectedDate);
  };
  const adjustDateForLateNight = (date: Date): { adjustedDate: Date; isLateNight: boolean } => {
    if (shouldAdjustForLateNight(date)) {
      const adjusted = new Date(date);
      adjusted.setDate(adjusted.getDate() - 1);
      return { adjustedDate: adjusted, isLateNight: true };
    }
    return { adjustedDate: date, isLateNight: false };
  };

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

  // ========== SCROLL ==========
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========== FETCH BOOKED DATES ==========
  const fetchBookedDates = useCallback(async (propertyId: string) => {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('propertyID', '==', propertyId),
        where('paymentStatus', 'in', ['Paid', 'Pending Verification'])
      );
      const querySnapshot = await getDocs(q);
      const dates: Date[] = [];
      querySnapshot.docs.forEach((docSnap) => {
        const booking = docSnap.data();
        const startDate = (booking.checkInDate as Timestamp)?.toDate();
        const endDate = (booking.checkOutDate as Timestamp)?.toDate();
        if (startDate && endDate) {
          const currentDate: Date = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });
      setBookedDates(dates);
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  }, []);

  // ========== FETCH DATA ==========
  const fetchData = useCallback(async (id: string) => {
    if (!id) {
      setError('Property ID not found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const propertyDoc = await getDoc(doc(db, 'properties', id));
      if (!propertyDoc.exists()) {
        setError('Property not found');
        setLoading(false);
        return;
      }

      const data = propertyDoc.data();
      
      let brandColor = '#21409A';
      let brandName = '';
      let disabledDateObjs: Date[] = [];
      let windowDays = 30;
      let saturdayMode = false;
      let saturdayIncrease = 0;
      let specialPrices = {};

      if (data.managementID) {
        const mgmtDoc = await getDoc(doc(db, 'management', data.managementID));
        if (mgmtDoc.exists()) {
          const mgmtData = mgmtDoc.data();
          brandColor = mgmtData.brandColor || '#21409A';
          brandName = mgmtData.brandName || mgmtData.managementName;
          disabledDateObjs = (mgmtData.disabledBookingDates || []).map((d: string) => new Date(d));
          windowDays = mgmtData.bookingWindowDays || 30;
          saturdayMode = mgmtData.saturdayPricingMode || false;
          saturdayIncrease = mgmtData.saturdayPriceIncrease || 0;
          specialPrices = mgmtData.specialDatePricing || {};
          
          setDisabledDates(disabledDateObjs);
          setBookingWindowDays(windowDays);
          setSaturdayPricingMode(saturdayMode);
          setSaturdayPriceIncrease(saturdayIncrease);
          setSpecialDatePricing(specialPrices);
          
          const maxDate = new Date();
          maxDate.setDate(maxDate.getDate() + windowDays);
          setMaxAllowedDate(maxDate);
        }
      }

      const propertyData: Property = {
        id: propertyDoc.id,
        name: data.name || 'Property',
        city: data.city || '',
        country: data.country || 'Indonesia',
        price: data.price || 0,
        directPrice: data.directPrice || 0,
        photoURLs: data.photoURLs || [],
        propertyType: data.propertyType || 'Apartment',
        roomType: data.roomType || '',
        floor: data.floor || 0,
        tower: data.tower || '',
        unitNumber: data.unitNumber || '',
        availability: data.availability || 'available',
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        facilities: data.facilities || [],
        managementID: data.managementID,
        managementName: brandName,
        managementBrandColor: brandColor,
        description: data.description || '',
        streetAddress: data.streetAddress || '',
        guestAccommodation: data.guestAccommodation || 'Entire Place',
        videoLink: data.videoLink || '',
        propertyLocationName: data.propertyLocationName || '',
        agentDiscount: data.agentDiscount || 0,
        directDiscount: data.directDiscount || 0,
      };

      setProperty(propertyData);
      await fetchBookedDates(id);

    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err instanceof Error ? err.message : t.errorFetch);
    } finally {
      setLoading(false);
    }
  }, [t.errorFetch, fetchBookedDates]);

  // ========== WATCH ROUTER ==========
  useEffect(() => {
    if (!router.isReady) return;
    const id = router.query.id as string;
    if (id) {
      fetchData(id);
    } else {
      setError('Property ID not found in URL');
      setLoading(false);
    }
  }, [router.isReady, router.query.id, fetchData]);

  // ========== HELPER: CHECK BLOCKED RANGE ==========
  const hasBlockedDateInRange = useCallback((start: Date, end: Date, blockedDates: Date[]): boolean => {
    const current: Date = new Date(start);
    const endDate: Date = new Date(end);
    while (current < endDate) {
      const isBlocked = blockedDates.some(d =>
        d.getFullYear() === current.getFullYear() &&
        d.getMonth() === current.getMonth() &&
        d.getDate() === current.getDate()
      );
      if (isBlocked) return true;
      current.setDate(current.getDate() + 1);
    }
    return false;
  }, []);

  // ========== CHECK AVAILABILITY ==========
  const checkAvailability = useCallback(async (
    propertyId: string,
    checkIn: Date,
    checkOut: Date
  ): Promise<{ available: boolean; message?: string }> => {
    if (!checkIn || !checkOut) {
      return { available: false, message: 'Silakan pilih tanggal check-in dan check-out' };
    }
    if (checkIn >= checkOut) {
      return { available: false, message: t.invalidDates };
    }
    try {
      const q = query(
        collection(db, 'bookings'),
        where('propertyID', '==', propertyId),
        where('checkOutDate', '>', checkIn),
        where('checkInDate', '<', checkOut),
        where('paymentStatus', 'in', ['Pending Verification', 'Paid'])
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return { available: false, message: t.propertyAlreadyBooked };
      }
      return { available: true };
    } catch (err) {
      console.error('Error checking availability:', err);
      return { available: false, message: t.errorFetch };
    }
  }, [t]);

  // ========== DATE HANDLERS ==========
  const allBlockedDates = [...bookedDates, ...disabledDates];

  const handleCheckInChange = (date: Date | null) => {
    if (!date) {
      setCheckInDate(null);
      setDateError(null);
      return;
    }

    if (maxAllowedDate && date > maxAllowedDate) {
      setDateError(t.bookingWindowWarning.replace('{days}', bookingWindowDays.toString()));
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    if (allBlockedDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    )) {
      setDateError('Tanggal ini tidak tersedia');
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    if (checkOutDate) {
      const hasBlocked = hasBlockedDateInRange(date, checkOutDate, allBlockedDates);
      if (hasBlocked) {
        setDateError('Terdapat tanggal yang sudah dipesan dalam rentang ini');
        setTimeout(() => setDateError(null), 3000);
        return;
      }
    }

    const { isLateNight } = adjustDateForLateNight(date);
    if (isLateNight) {
      setPendingCheckInDate(date);
      setShowLateNightConfirmModal(true);
      return;
    }

    setCheckInDate(date);
    setIsLateNightBooking(false);
    setLateNightInfo(null);

    if (checkOutDate && date >= checkOutDate) {
      setCheckOutDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
    }
    setDateError(null);
  };

  const confirmLateNightBooking = () => {
    if (!pendingCheckInDate) return;
    const actualDate = new Date(pendingCheckInDate);
    actualDate.setDate(actualDate.getDate() - 1);
    setCheckInDate(actualDate);
    setIsLateNightBooking(true);
    setLateNightInfo({
      originalDate: pendingCheckInDate,
      actualDate: actualDate,
      hour: pendingCheckInDate.getHours(),
      minute: pendingCheckInDate.getMinutes(),
    });
    setShowLateNightConfirmModal(false);
    setPendingCheckInDate(null);
    if (checkOutDate && actualDate >= checkOutDate) {
      setCheckOutDate(new Date(actualDate.getTime() + 24 * 60 * 60 * 1000));
    }
    setDateError(null);
  };

  const cancelLateNightBooking = () => {
    setShowLateNightConfirmModal(false);
    setPendingCheckInDate(null);
  };

  const handleCheckOutChange = (date: Date | null) => {
    if (!date) {
      setCheckOutDate(null);
      setDateError(null);
      return;
    }

    if (maxAllowedDate && date > maxAllowedDate) {
      setDateError(t.bookingWindowWarning.replace('{days}', bookingWindowDays.toString()));
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    if (allBlockedDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    )) {
      setDateError('Tanggal ini tidak tersedia');
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    if (checkInDate) {
      const hasBlocked = hasBlockedDateInRange(checkInDate, date, allBlockedDates);
      if (hasBlocked) {
        setDateError('Terdapat tanggal yang sudah dipesan dalam rentang ini');
        setTimeout(() => setDateError(null), 3000);
        return;
      }
    }

    if (date && checkInDate && date <= checkInDate) {
      setCheckInDate(new Date(date.getTime() - 24 * 60 * 60 * 1000));
    }
    setCheckOutDate(date);
  };

  // ========== HANDLE BOOK NOW ==========
  const handleBookNow = async () => {
    if (!checkInDate || !checkOutDate) {
      toast.warning(t.selectCheckIn);
      return;
    }
    if (!property) return;
    setIsCheckingAvailability(true);
    setDateError(null);
    try {
      const result = await checkAvailability(property.id, checkInDate, checkOutDate);
      if (result.available) {
        toast.success('Residences tersedia! Mengalihkan ke halaman booking...');
        setTimeout(() => {
          const params = new URLSearchParams({
            propertyId: property.id,
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
          });
          if (isLateNightBooking && lateNightInfo) {
            params.set('isLateNightBooking', 'true');
            params.set('originalCheckIn', lateNightInfo.originalDate.toISOString());
          }
          router.push(`/payment?${params.toString()}`);
        }, 1500);
      } else {
        setDateError(result.message || t.propertyUnavailable);
        toast.error(result.message || t.propertyUnavailable);
      }
    } catch (err) {
      console.error('Availability check error:', err);
      setDateError(t.errorFetch);
      toast.error(t.errorFetch);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // ========== CALCULATE TOTAL ==========
  useEffect(() => {
    if (!checkInDate || !checkOutDate || !property) {
      setTotalPrice(0);
      return;
    }
    const nights = differenceInDays(checkOutDate, checkInDate);
    if (nights <= 0) {
      setTotalPrice(0);
      return;
    }
    let total = 0;
    const basePrice = property.directPrice || property.price || 0;
    const directDiscount = property.directDiscount || 0;
    const propertyType = property.propertyType || '';
    const roomType = property.roomType || '';

    for (let i = 0; i < nights; i++) {
      const currentDate: Date = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = getLocalDateStr(currentDate);
      const dayOfWeek = currentDate.getDay();

      let dailyPrice = basePrice;

      const special = specialDatePricing?.[dateStr]?.[propertyType]?.[roomType];
      if (special) {
        const specialDirectPrice = special.directPrice ?? special.agentPrice;
        if (specialDirectPrice !== undefined && specialDirectPrice !== null && specialDirectPrice > 0) {
          dailyPrice = specialDirectPrice;
        }
        const specialDirectDiscount = special.directDiscount ?? special.agentDiscount ?? 0;
        if (specialDirectDiscount > 0) {
          dailyPrice = dailyPrice * (1 - specialDirectDiscount / 100);
        }
      } else if (saturdayPricingMode && dayOfWeek === 6) {
        dailyPrice = basePrice + saturdayPriceIncrease;
        if (directDiscount > 0) {
          dailyPrice = dailyPrice * (1 - directDiscount / 100);
        }
      } else {
        if (directDiscount > 0) {
          dailyPrice = basePrice * (1 - directDiscount / 100);
        }
      }
      total += dailyPrice;
    }
    setTotalPrice(Math.round(total));
  }, [checkInDate, checkOutDate, property, specialDatePricing, saturdayPricingMode, saturdayPriceIncrease]);

  // ========== PHOTO NAVIGATION ==========
  const nextPhoto = useCallback(() => {
    if (!property?.photoURLs) return;
    setCurrentPhotoIndex((prev) => (prev + 1) % property.photoURLs.length);
  }, [property?.photoURLs]);

  const prevPhoto = useCallback(() => {
    if (!property?.photoURLs) return;
    setCurrentPhotoIndex((prev) => (prev - 1 + property.photoURLs.length) % property.photoURLs.length);
  }, [property?.photoURLs]);

  // ========== THEME ==========
  const bgDark = isDarkMode ? 'bg-[#081120]' : 'bg-[#F8FAFC]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#0F172A]';
  const textSecondary = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';
  
  const displayPrice = property?.directPrice || property?.price || 0;
  const displayDiscount = property?.directDiscount || 0;

  const hasSpecialDate = ((): boolean => {
    if (!checkInDate || !checkOutDate || !property) return false;
    const nightsCount = differenceInDays(checkOutDate, checkInDate);
    for (let i = 0; i < nightsCount; i++) {
      const d: Date = new Date(checkInDate);
      d.setDate(d.getDate() + i);
      const dateStr = getLocalDateStr(d);
      if (specialDatePricing?.[dateStr]?.[property.propertyType || '']?.[property.roomType || '']) {
        return true;
      }
    }
    return false;
  })();

  const hasSaturdayPrice = ((): boolean => {
    if (!checkInDate || !checkOutDate || !saturdayPricingMode) return false;
    const nightsCount = differenceInDays(checkOutDate, checkInDate);
    for (let i = 0; i < nightsCount; i++) {
      const d: Date = new Date(checkInDate);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 6) return true;
    }
    return false;
  })();

  // ========== LOADING / ERROR ==========
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgDark}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgDark} p-4`}>
        <div className="text-center max-w-md">
          <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Oops!</h1>
          <p className={`${textSecondary} mb-6`}>{error || 'Properti tidak ditemukan'}</p>
          <Link href="/properties">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#21409A] text-white rounded-xl hover:bg-[#4F7DFF] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.backToProperties}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const nights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const allDisabledDates = [...bookedDates, ...disabledDates];
  const photoUrls = property.photoURLs || [];
  const facilities = property.facilities || [];

  // ========== RENDER ==========
  return (
    <div className={`${bgDark} transition-colors duration-300 min-h-screen relative`}>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="top-right" autoClose={3000} />

      {/* ========== LATE-NIGHT CONFIRM MODAL ========== */}
      <AnimatePresence>
        {showLateNightConfirmModal && pendingCheckInDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4"
            onClick={cancelLateNightBooking}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-3xl shadow-2xl max-w-md w-full p-6 border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                  <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                  {t.lateNightBooking}
                </h2>
                <p className={`${textSecondary} mb-4 text-sm`}>
                  {t.lateNightDesc
                    .replace('{hour}', pendingCheckInDate.getHours().toString().padStart(2, '0'))
                    .replace('{minute}', pendingCheckInDate.getMinutes().toString().padStart(2, '0'))}
                </p>
                <div className={`p-4 ${isDarkMode ? 'bg-[#1a1a1a]' : 'bg-gray-100'} rounded-2xl mb-4`}>
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    📅 {t.originalDate}
                  </p>
                  <p className={`text-base font-semibold ${textPrimary}`}>
                    {formatDisplayDate(pendingCheckInDate)}
                  </p>
                  <div className="my-3 flex justify-center">
                    <ArrowDown className="w-5 h-5 text-[#4F7DFF]" />
                  </div>
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    🛏️ {t.actualDate}
                  </p>
                  <p className={`text-base font-semibold text-[#4F7DFF]`}>
                    {formatDisplayDate(
                      (() => {
                        const d = new Date(pendingCheckInDate);
                        d.setDate(d.getDate() - 1);
                        return d;
                      })()
                    )}
                  </p>
                </div>
                <p className={`text-xs ${textSecondary} mb-6`}>
                  {t.lateNightInfo}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={cancelLateNightBooking}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-medium rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={confirmLateNightBooking}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#21409A] to-[#4F7DFF] text-white font-medium rounded-xl hover:shadow-lg transition-all"
                  >
                    {t.continueBooking}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? `${isDarkMode ? 'bg-[#081120]/95' : 'bg-white/95'} backdrop-blur-xl shadow-lg`
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#21409A] flex items-center justify-center">
                <span className="text-white font-bold text-sm">EX</span>
              </div>
              <span className={`text-lg font-semibold tracking-tight ${isScrolled ? textPrimary : 'text-white'}`}>
                EXROOM
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className={`text-sm font-medium ${isScrolled ? textPrimary : 'text-white/80'} hover:text-[#4F7DFF] transition`}>
                {t.home}
              </Link>
              <Link href="/properties" className={`text-sm font-medium ${isScrolled ? textPrimary : 'text-white/80'} hover:text-[#4F7DFF] transition border-b-2 border-[#4F7DFF]`}>
                {t.properties}
              </Link>
              <a href="#contact" className={`text-sm font-medium ${isScrolled ? textPrimary : 'text-white/80'} hover:text-[#4F7DFF] transition`}>
                {t.contact}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition ${isScrolled ? 'hover:bg-[#4F7DFF]/10' : 'hover:bg-white/10'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : isScrolled ? textPrimary : 'text-white'}`} />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-full transition ${isScrolled ? 'hover:bg-[#4F7DFF]/10' : 'hover:bg-white/10'}`}
              >
                {isDarkMode ? (
                  <Sun className={`w-5 h-5 ${isScrolled ? textPrimary : 'text-white'}`} />
                ) : (
                  <Moon className={`w-5 h-5 ${isScrolled ? textPrimary : 'text-white'}`} />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`p-2 rounded-full transition flex items-center gap-1 ${isScrolled ? 'hover:bg-[#4F7DFF]/10' : 'hover:bg-white/10'}`}
                >
                  <Globe className={`w-5 h-5 ${isScrolled ? textPrimary : 'text-white'}`} />
                  <span className={`text-xs font-medium ${isScrolled ? textPrimary : 'text-white'}`}>
                    {language === 'id' ? 'ID' : 'EN'}
                  </span>
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full right-0 mt-2 w-40 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-xl shadow-xl overflow-hidden border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} z-50`}
                    >
                      <button
                        onClick={() => { setLanguage('id'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2`}
                      >
                        🇮🇩 Indonesia {language === 'id' && <CheckCircle className="w-4 h-4 text-[#4F7DFF] ml-auto" />}
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2 border-t ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}
                      >
                        🇬🇧 English {language === 'en' && <CheckCircle className="w-4 h-4 text-[#4F7DFF] ml-auto" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`md:hidden p-2 rounded-full transition ${isScrolled ? 'hover:bg-[#4F7DFF]/10' : 'hover:bg-white/10'}`}
              >
                <Menu className={`w-5 h-5 ${isScrolled ? textPrimary : 'text-white'}`} />
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
              className={`md:hidden ${isDarkMode ? 'bg-[#081120]' : 'bg-white'} border-t ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} p-6`}
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

      {/* ========== BACK BUTTON (Floating) ========== */}
      <div className="fixed top-24 left-6 z-40 hidden md:block">
        <Link href="/properties">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-[#101827]/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-[#1E293B]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Kembali</span>
          </motion.button>
        </Link>
      </div>

      {/* ========== HERO GALLERY ========== */}
      <div ref={heroRef} className="relative h-[70vh] md:h-[80vh] lg:h-[90vh] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          {photoUrls.length > 0 ? (
            <>
              <Image
                src={photoUrls[currentPhotoIndex] || '/placeholder.jpg'}
                alt={property.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081120] via-[#081120]/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#21409A]/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#21409A]/20 to-[#4F7DFF]/10 flex items-center justify-center">
              <Home className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </motion.div>

        {/* Overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                property.availability === 'available'
                  ? 'bg-green-500/90 text-white'
                  : property.availability === 'maintenance'
                  ? 'bg-yellow-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              } backdrop-blur-sm`}>
                {property.availability === 'available' ? '● ' + t.available :
                 property.availability === 'maintenance' ? t.maintenance : '● ' + t.occupied}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs">
                {property.propertyType}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
              {property.name}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-white/80">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{property.city}, {property.country}</span>
              </div>
              {property.propertyLocationName && (
                <>
                  <span className="w-px h-4 bg-white/30" />
                  <span className="text-sm">{property.propertyLocationName}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-white/30'}`} />
                ))}
              </div>
              <span className="text-white/70 text-sm">5.0 (120 {t.rating})</span>
            </div>
          </motion.div>
        </div>

        {/* Photo navigation */}
        {photoUrls.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-20"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all z-20"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {photoUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`transition-all rounded-full ${idx === currentPhotoIndex ? 'w-8 h-2 bg-[#4F7DFF]' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                />
              ))}
            </div>
            <div className="absolute top-6 right-6 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white text-xs">
              {currentPhotoIndex + 1} / {photoUrls.length}
            </div>
          </>
        )}

        {/* View all photos button */}
        <button
          onClick={() => setShowGalleryModal(true)}
          className="absolute bottom-28 right-6 md:right-12 z-20 px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-white text-sm hover:bg-black/60 transition-all flex items-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          Lihat Semua
        </button>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick stats card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`${isDarkMode ? 'bg-[#101827]/80' : 'bg-white/80'} backdrop-blur-md rounded-2xl p-6 border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} shadow-xl`}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Bed className={`w-5 h-5 mx-auto mb-1 ${textSecondary}`} />
                  <p className={`text-sm font-medium ${textPrimary}`}>{property.bedrooms || 1} {t.bedrooms}</p>
                </div>
                <div className="text-center">
                  <Bath className={`w-5 h-5 mx-auto mb-1 ${textSecondary}`} />
                  <p className={`text-sm font-medium ${textPrimary}`}>{property.bathrooms || 1} {t.bathrooms}</p>
                </div>
                <div className="text-center">
                  <Users className={`w-5 h-5 mx-auto mb-1 ${textSecondary}`} />
                  <p className={`text-sm font-medium ${textPrimary}`}>{property.guestAccommodation || '2 guests'}</p>
                  <p className={`text-xs ${textSecondary}`}>{t.guests}</p>
                </div>
                <div className="text-center">
                  <Building2 className={`w-5 h-5 mx-auto mb-1 ${textSecondary}`} />
                  <p className={`text-sm font-medium ${textPrimary}`}>Tower {property.tower}</p>
                  <p className={`text-xs ${textSecondary}`}>Unit {property.unitNumber}</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            {property.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className={`text-xl font-semibold ${textPrimary} mb-3`}>Deskripsi</h2>
                <p className={`${textSecondary} leading-relaxed text-sm md:text-base`}>
                  {property.description}
                </p>
              </motion.div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className={`text-xl font-semibold ${textPrimary} mb-4`}>{t.facilities}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {facilities.map((facility, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} transition-all`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#4F7DFF]/20 flex items-center justify-center text-[#4F7DFF]">
                        {getFacilityIcon(facility)}
                      </div>
                      <span className={`text-sm ${textPrimary}`}>{facility}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Location info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className={`p-4 rounded-xl ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'}`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#4F7DFF]" />
                <span className={textPrimary}>{property.streetAddress || `${property.city}, ${property.country}`}</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                <span>🏢 Tower {property.tower}</span>
                <span>•</span>
                <span>{t.floor} {property.floor}</span>
                <span>•</span>
                <span>Unit {property.unitNumber}</span>
              </div>
            </motion.div>

            {/* Virtual Tour */}
            {property.videoLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className={`text-xl font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <Play className="w-5 h-5 text-red-500" />
                  {t.virtualTour}
                </h2>
                <div
                  className="relative aspect-video rounded-2xl overflow-hidden bg-black cursor-pointer group"
                  onClick={() => setShowVideoModal(true)}
                >
                  <video
                    controls
                    className="absolute inset-0 w-full h-full"
                    poster={photoUrls[0] || ''}
                  >
                    <source src={property.videoLink} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-xl">
                      <Maximize2 className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${isDarkMode ? 'bg-[#101827]/90' : 'bg-white/90'} backdrop-blur-xl rounded-2xl p-6 border ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} shadow-2xl`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-sm ${textSecondary}`}>{t.perNight}</p>
                    <p className="text-3xl font-bold text-[#4F7DFF]">
                      {formatCurrency(displayPrice)}
                      {displayDiscount > 0 && (
                        <span className={`text-sm ml-2 ${textSecondary}`}>
                          ({t.priceIncludesDiscount.replace('{discount}', displayDiscount.toString())})
                        </span>
                      )}
                    </p>
                    {(hasSpecialDate || hasSaturdayPrice) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        <Tag className="w-3 h-3" />
                        {hasSpecialDate ? t.specialPrice : t.saturdayPrice}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      property.availability === 'available'
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {property.availability === 'available' ? '✓ ' + t.available : t.occupied}
                    </span>
                  </div>
                </div>

                {maxAllowedDate && (
                  <div className={`mb-4 p-3 rounded-xl text-xs ${isDarkMode ? 'bg-[#21409A]/10 text-[#4F7DFF]' : 'bg-[#21409A]/5 text-[#0F172A]'} border border-[#21409A]/20`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{t.bookingWindowTitle}</span>
                    </div>
                    <div className="mt-1 text-xs opacity-75">
                      {t.bookingWindowWarning.replace('{days}', bookingWindowDays.toString())}
                    </div>
                    <div className="mt-1 text-xs opacity-75">
                      {t.maxDateInfo.replace('{date}', maxAllowedDate.toLocaleDateString())}
                    </div>
                  </div>
                )}

                {isLateNightBooking && lateNightInfo && (
                  <div className={`mb-4 p-3 rounded-xl text-xs ${isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700'} border border-purple-200 dark:border-purple-800`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{t.lateNightBooking}</span>
                    </div>
                    <div className="mt-1 text-xs opacity-75">
                      {t.lateNightBanner
                        .replace('{hour}', lateNightInfo.hour.toString().padStart(2, '0'))
                        .replace('{minute}', lateNightInfo.minute.toString().padStart(2, '0'))
                        .replace('{date}', formatDisplayDate(lateNightInfo.actualDate))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t.checkIn}</label>
                    <DatePicker
                      selected={checkInDate}
                      onChange={handleCheckInChange}
                      minDate={new Date()}
                      maxDate={maxAllowedDate || undefined}
                      excludeDates={allDisabledDates}
                      placeholderText={t.selectDate}
                      customInput={<CustomDateInput placeholder={t.selectDate} isDarkMode={isDarkMode} />}
                      popperPlacement="bottom-start"
                    />
                    {isLateNightBooking && lateNightInfo && (
                      <p className={`text-xs mt-1 ${textSecondary}`}>
                        <span className="line-through mr-1">{formatDisplayDate(lateNightInfo.originalDate)}</span>
                        → {formatDisplayDate(lateNightInfo.actualDate)}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>{t.checkOut}</label>
                    <DatePicker
                      selected={checkOutDate}
                      onChange={handleCheckOutChange}
                      minDate={checkInDate ? addDays(checkInDate, 1) : new Date()}
                      maxDate={maxAllowedDate || undefined}
                      excludeDates={allDisabledDates}
                      placeholderText={t.selectDate}
                      customInput={<CustomDateInput placeholder={t.selectDate} isDarkMode={isDarkMode} />}
                      popperPlacement="bottom-start"
                    />
                  </div>

                  {dateError && (
                    <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-red-400">{dateError}</span>
                    </div>
                  )}

                  {checkInDate && checkOutDate && nights > 0 && !dateError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 border-t border-gray-200 dark:border-[rgba(255,255,255,0.08)]"
                    >
                      <div className="flex justify-between text-sm">
                        <span className={textSecondary}>
                          {formatCurrency(displayPrice)} x {nights} {t.nights}
                          {hasSpecialDate && <span className="ml-1 text-amber-500">✨</span>}
                          {hasSaturdayPrice && <span className="ml-1 text-blue-400">📈</span>}
                        </span>
                        <span className={textPrimary}>{formatCurrency(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold mt-2">
                        <span className={textPrimary}>{t.total}</span>
                        <span className="text-[#4F7DFF]">{formatCurrency(totalPrice)}</span>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={handleBookNow}
                    disabled={isCheckingAvailability || !checkInDate || !checkOutDate || property.availability !== 'available'}
                    className={`w-full py-3.5 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 ${
                      isCheckingAvailability || !checkInDate || !checkOutDate || property.availability !== 'available'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#21409A] to-[#4F7DFF] hover:shadow-lg hover:shadow-[#21409A]/30'
                    }`}
                  >
                    {isCheckingAvailability ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t.loading}
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        {t.bookNow}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== GALLERY MODAL ========== */}
      <AnimatePresence>
        {showGalleryModal && property && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGalleryModal(false)}
          >
            <button
              onClick={() => setShowGalleryModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-5xl h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photoUrls[currentPhotoIndex] || '/placeholder.jpg'}
                alt={property.name}
                fill
                className="object-contain"
                unoptimized
              />
              {photoUrls.length > 1 && (
                <>
                  <button
                    onClick={prevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {photoUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentPhotoIndex ? 'bg-[#4F7DFF] w-6' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== VIDEO MODAL ========== */}
      <AnimatePresence>
        {showVideoModal && property?.videoLink && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowVideoModal(false)}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-5xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                controls
                autoPlay
                className="w-full h-full rounded-xl"
                poster={photoUrls[0] || ''}
              >
                <source src={property.videoLink} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== FOOTER ========== */}
      <footer className={`border-t ${isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]'} py-8 px-6 lg:px-8 max-w-7xl mx-auto mt-16`}>
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
        .react-datepicker {
          font-family: 'Inter', sans-serif !important;
          border-radius: 1rem !important;
          border: 1px solid #E2E8F0 !important;
          box-shadow: 0 20px 60px -12px rgba(0,0,0,0.25) !important;
          overflow: hidden !important;
        }
        .dark .react-datepicker {
          background-color: #101827 !important;
          border-color: rgba(33,64,154,0.3) !important;
        }
        .dark .react-datepicker__header {
          background-color: #081120 !important;
          border-bottom-color: rgba(33,64,154,0.2) !important;
        }
        .dark .react-datepicker__current-month,
        .dark .react-datepicker__day-name {
          color: #f3f4f6 !important;
        }
        .dark .react-datepicker__day {
          color: #d1d5db !important;
        }
        .dark .react-datepicker__day:hover {
          background-color: #1e293b !important;
        }
        .dark .react-datepicker__day--selected {
          background-color: #21409A !important;
          color: white !important;
        }
        .dark .react-datepicker__day--keyboard-selected {
          background-color: #4F7DFF !important;
          color: white !important;
        }
        .dark .react-datepicker__day--disabled {
          color: #4b5563 !important;
        }
        .react-datepicker__day--selected {
          background-color: #21409A !important;
          color: white !important;
        }
        .react-datepicker__day--keyboard-selected {
          background-color: #4F7DFF !important;
          color: white !important;
        }
        .react-datepicker__day--selected:hover {
          background-color: #4F7DFF !important;
          color: white !important;
        }
        .react-datepicker__day--keyboard-selected:hover {
          background-color: #21409A !important;
          color: white !important;
        }
        .react-datepicker__navigation {
          top: 12px !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: #4F7DFF !important;
        }
        .dark .react-datepicker__navigation-icon::before {
          border-color: #4F7DFF !important;
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

// ========== HELPER: FACILITY ICON ==========
function getFacilityIcon(facility: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-4 h-4" />,
    'TV': <Tv className="w-4 h-4" />,
    'Coffee Maker': <Coffee className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />,
    'Gym': <Dumbbell className="w-4 h-4" />,
    'AC': <Sparkles className="w-4 h-4" />,
    'Pool': <Shield className="w-4 h-4" />,
  };
  return icons[facility] || <Check className="w-4 h-4" />;
}