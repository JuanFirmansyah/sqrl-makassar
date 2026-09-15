// src/pages/payment/index.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebaseConfig';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  ArrowLeft,
  Calendar,
  Home,
  Bed,
  Bath,
  X,
  Loader2,
  AlertCircle,
  Clock,
  Users,
  CreditCard,
  Upload,
  Send,
  Image as ImageIcon,
  Info,
  CheckCircle as CheckCircleIcon,
  AlertTriangle,
  Ticket,
  Percent,
  Sun,
  Moon,
  Globe,
  Menu,
  Star,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
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
  directDiscount?: number;
}

interface Management {
  id: string;
  managementName: string;
  brandName?: string;
  brandColor?: string;
  bankAccounts?: Array<{
    accountNumber: string;
    bankName: string;
    accountHolderName: string;
  }>;
  disabledBookingDates?: string[];
  bookingWindowDays?: number;
  adminFee?: number;
  saturdayPricingMode?: boolean;
  saturdayPriceIncrease?: number;
  specialDatePricing?: Record<string, Record<string, Record<string, { agentPrice?: number; directPrice?: number; agentDiscount?: number; directDiscount?: number }>>>;
}

interface Voucher {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  appliesTo: 'all' | string[];
  startDate?: Date;
  endDate?: Date;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

type Language = 'id' | 'en';

// ========== TRANSLATIONS ==========
const translations = {
  id: {
    title: 'Konfirmasi Pembayaran',
    subtitle: 'Lengkapi pembayaran untuk mengonfirmasi pemesanan Anda',
    backToProperty: 'Kembali ke Properti',
    bookingSummary: 'Ringkasan Pemesanan',
    property: 'Properti',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Malam',
    totalPrice: 'Total Harga',
    adminFee: 'Biaya Admin',
    totalPayment: 'Total Pembayaran',
    transferTo: 'Transfer ke rekening berikut:',
    bankAccounts: 'Rekening Bank Tujuan',
    noBankAccounts: 'Belum ada rekening bank yang terdaftar. Hubungi manajemen properti.',
    copyAccount: 'Salin Nomor Rekening',
    copied: 'Tersalin!',
    paymentInstructions: 'Instruksi Pembayaran',
    instruction1: '1. Transfer total pembayaran ke rekening bank di atas',
    instruction2: '2. Upload bukti transfer pada form di bawah',
    instruction3: '3. Tunggu konfirmasi dari manajemen (maksimal 1x24 jam)',
    uploadProof: 'Upload Bukti Pembayaran',
    uploadHere: 'Upload di sini',
    dragDrop: 'Seret & lepas atau klik untuk upload',
    supportedFormats: 'Format didukung: JPG, PNG, JPEG (max 2MB)',
    fileSelected: 'File terpilih: {name}',
    changeFile: 'Ganti File',
    preview: 'Pratinjau',
    terms: 'Saya menyetujui syarat & ketentuan yang berlaku',
    submitPayment: 'Kirim Pembayaran',
    submitting: 'Memproses...',
    success: 'Pembayaran berhasil dikirim! Menunggu konfirmasi manajemen.',
    error: 'Gagal memproses pembayaran. Silakan coba lagi.',
    errorCompleteFields: 'Harap lengkapi semua field yang wajib diisi.',
    errorUpload: 'Harap unggah bukti pembayaran.',
    errorTerms: 'Harap setujui syarat & ketentuan.',
    errorFileType: 'Hanya file PNG, JPG, atau JPEG yang diperbolehkan.',
    errorFileSize: 'Ukuran file tidak boleh melebihi 2MB.',
    errorFetch: 'Gagal memuat data properti',
    loading: 'Memuat...',
    retry: 'Coba Lagi',
    perNight: '/malam',
    unit: 'Unit',
    roomType: 'Tipe Kamar',
    bedrooms: 'Kamar Tidur',
    bathrooms: 'Kamar Mandi',
    guests: 'Tamu',
    type: 'Tipe',
    available: 'Tersedia',
    maintenance: 'Pemeliharaan',
    occupied: 'Terisi',
    priceNote: 'Harga khusus untuk tamu langsung',
    termsText: 'Dengan mengklik "Kirim Pembayaran", Anda menyetujui bahwa data Anda akan diproses sesuai dengan kebijakan privasi kami.',
    invalidPhone: 'Nomor telepon tidak valid. Masukkan dengan kode negara (contoh: +62 8123456789)',
    phonePlaceholder: '+62 8123456789',
    sessionExpired: 'Sesi Anda telah berakhir. Silakan pilih tanggal kembali.',
    redirecting: 'Mengalihkan ke halaman properti...',
    timeoutWarning: 'Waktu tersisa: {minutes} menit {seconds} detik',
    timeoutTitle: 'Waktu Pembayaran',
    timeoutMessage: 'Anda memiliki waktu 15 menit untuk menyelesaikan pembayaran. Jika melebihi, Anda harus memilih tanggal kembali.',
    voucher: 'Kode Voucher',
    voucherPlaceholder: 'Masukkan kode voucher',
    voucherApply: 'Terapkan',
    voucherRemove: 'Hapus',
    voucherApplied: 'Voucher berhasil diterapkan!',
    voucherError: 'Kode voucher tidak valid. Coba lagi.',
    voucherInvalidFormat: 'Hanya huruf kapital dan angka yang diperbolehkan.',
    voucherDiscount: 'Diskon Voucher',
    voucherNote: 'Masukkan kode voucher untuk mendapatkan diskon',
    voucherNotFound: 'Voucher tidak ditemukan',
    voucherExpired: 'Voucher sudah kadaluarsa',
    voucherInactive: 'Voucher tidak aktif',
    voucherLimitReached: 'Kuota penggunaan voucher sudah habis',
    home: 'Beranda',
    properties: 'Properti',
    contact: 'Kontak',
    rating: 'ulasan',
    specialPrice: 'Harga Khusus',
    saturdayPrice: 'Harga Sabtu',
    copy: 'Salin',
  },
  en: {
    title: 'Payment Confirmation',
    subtitle: 'Complete your payment to confirm your booking',
    backToProperty: 'Back to Property',
    bookingSummary: 'Booking Summary',
    property: 'Property',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Nights',
    totalPrice: 'Total Price',
    adminFee: 'Admin Fee',
    totalPayment: 'Total Payment',
    transferTo: 'Transfer to the following account:',
    bankAccounts: 'Destination Bank Accounts',
    noBankAccounts: 'No bank accounts registered. Contact property management.',
    copyAccount: 'Copy Account Number',
    copied: 'Copied!',
    paymentInstructions: 'Payment Instructions',
    instruction1: '1. Transfer the total payment to the bank account above',
    instruction2: '2. Upload the transfer proof in the form below',
    instruction3: '3. Wait for management confirmation (max 1x24 hours)',
    uploadProof: 'Upload Payment Proof',
    uploadHere: 'Upload here',
    dragDrop: 'Drag & drop or click to upload',
    supportedFormats: 'Supported formats: JPG, PNG, JPEG (max 2MB)',
    fileSelected: 'File selected: {name}',
    changeFile: 'Change File',
    preview: 'Preview',
    terms: 'I agree to the terms & conditions',
    submitPayment: 'Submit Payment',
    submitting: 'Processing...',
    success: 'Payment submitted! Waiting for management confirmation.',
    error: 'Failed to process payment. Please try again.',
    errorCompleteFields: 'Please complete all required fields.',
    errorUpload: 'Please upload payment proof.',
    errorTerms: 'Please agree to the terms & conditions.',
    errorFileType: 'Only PNG, JPG, or JPEG files are allowed.',
    errorFileSize: 'File size must not exceed 2MB.',
    errorFetch: 'Failed to load property data',
    loading: 'Loading...',
    retry: 'Retry',
    perNight: '/night',
    unit: 'Unit',
    roomType: 'Room Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    guests: 'Guests',
    type: 'Type',
    available: 'Available',
    maintenance: 'Maintenance',
    occupied: 'Occupied',
    priceNote: 'Special price for direct guests',
    termsText: 'By clicking "Submit Payment", you agree that your data will be processed in accordance with our privacy policy.',
    invalidPhone: 'Invalid phone number. Include country code (e.g., +62 8123456789)',
    phonePlaceholder: '+62 8123456789',
    sessionExpired: 'Your session has expired. Please select dates again.',
    redirecting: 'Redirecting to property page...',
    timeoutWarning: 'Time remaining: {minutes} minutes {seconds} seconds',
    timeoutTitle: 'Payment Timeout',
    timeoutMessage: 'You have 15 minutes to complete payment. If you exceed, you must select dates again.',
    voucher: 'Voucher Code',
    voucherPlaceholder: 'Enter voucher code',
    voucherApply: 'Apply',
    voucherRemove: 'Remove',
    voucherApplied: 'Voucher applied successfully!',
    voucherError: 'Invalid voucher code. Please try again.',
    voucherInvalidFormat: 'Only capital letters and numbers are allowed.',
    voucherDiscount: 'Voucher Discount',
    voucherNote: 'Enter voucher code to get discount',
    voucherNotFound: 'Voucher not found',
    voucherExpired: 'Voucher has expired',
    voucherInactive: 'Voucher is not active',
    voucherLimitReached: 'Voucher usage limit has been reached',
    home: 'Home',
    properties: 'Properties',
    contact: 'Contact',
    rating: 'reviews',
    specialPrice: 'Special Price',
    saturdayPrice: 'Saturday Price',
    copy: 'Copy',
  }
};

// ========== VALIDASI PHONE ==========
const validatePhoneNumber = (phone: string): boolean => {
  if (!phone.startsWith('+')) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
};

const formatPhoneDisplay = (value: string): string => {
  return value.replace(/[^+\d\s-]/g, '');
};

// ========== MAIN COMPONENT ==========
export default function PaymentPage() {
  const router = useRouter();
  const { propertyId, checkIn, checkOut } = router.query;

  // ========== TIMEOUT STATE ==========
  const TIMEOUT_MINUTES = 15;
  const [timeRemaining, setTimeRemaining] = useState(TIMEOUT_MINUTES * 60);
  const [isExpired, setIsExpired] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ========== STATE ==========
  const [property, setProperty] = useState<Property | null>(null);
  const [management, setManagement] = useState<Management | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Booking details
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [adminFee, setAdminFee] = useState<number>(2500);

  // ========== PRICING CONFIG FROM MANAGEMENT ==========
  const [specialDatePricing, setSpecialDatePricing] = useState<Record<string, Record<string, Record<string, { agentPrice?: number; directPrice?: number; agentDiscount?: number; directDiscount?: number }>>>>({});
  const [saturdayPricingMode, setSaturdayPricingMode] = useState(false);
  const [saturdayPriceIncrease, setSaturdayPriceIncrease] = useState(0);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // ========== VOUCHER STATE ==========
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [voucherDiscount, setVoucherDiscount] = useState<number>(0);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [isApplyingVoucher, setIsApplyingVoucher] = useState<boolean>(false);
  const [voucherApplied, setVoucherApplied] = useState<boolean>(false);
  const [appliedVoucherId, setAppliedVoucherId] = useState<string | null>(null);
  const [voucherType, setVoucherType] = useState<'percentage' | 'fixed'>('percentage');

  // UI
  const [language, setLanguage] = useState<Language>('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  // ========== TIMEOUT COUNTDOWN ==========
  useEffect(() => {
    timeoutRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timeoutRef.current!);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, []);

  // ========== HANDLE EXPIRY ==========
  useEffect(() => {
    if (isExpired) {
      toast.error(t.sessionExpired);
      setTimeout(() => {
        router.push(`/property/${propertyId}`);
      }, 3000);
    }
  }, [isExpired, router, propertyId, t.sessionExpired]);

  // ========== DARK MODE & LANGUAGE ==========
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

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_language') as Language | null;
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) setLanguage(savedLang);
    else setLanguage('id');
  }, []);

  // ========== SCROLL DETECTION ==========
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      
      let mgmt: Management | null = null;
      if (data.managementID) {
        const mgmtDoc = await getDoc(doc(db, 'management', data.managementID));
        if (mgmtDoc.exists()) {
          const mgmtData = mgmtDoc.data();
          mgmt = {
            id: mgmtDoc.id,
            managementName: mgmtData.managementName || 'Management',
            brandName: mgmtData.brandName || mgmtData.managementName,
            brandColor: mgmtData.brandColor || '#21409A',
            bankAccounts: mgmtData.bankAccounts || [],
            disabledBookingDates: mgmtData.disabledBookingDates || [],
            bookingWindowDays: mgmtData.bookingWindowDays || 30,
            adminFee: mgmtData.adminFee || 2500,
            saturdayPricingMode: mgmtData.saturdayPricingMode || false,
            saturdayPriceIncrease: mgmtData.saturdayPriceIncrease || 0,
            specialDatePricing: mgmtData.specialDatePricing || {},
          };
          setManagement(mgmt);
          setAdminFee(mgmtData.adminFee || 2500);
          setSaturdayPricingMode(mgmtData.saturdayPricingMode || false);
          setSaturdayPriceIncrease(mgmtData.saturdayPriceIncrease || 0);
          setSpecialDatePricing(mgmtData.specialDatePricing || {});
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
        managementName: mgmt?.brandName || mgmt?.managementName || '',
        managementBrandColor: mgmt?.brandColor || '#21409A',
        description: data.description || '',
        streetAddress: data.streetAddress || '',
        guestAccommodation: data.guestAccommodation || 'Entire Place',
        videoLink: data.videoLink || '',
        propertyLocationName: data.propertyLocationName || '',
        directDiscount: data.directDiscount || 0,
      };

      setProperty(propertyData);

    } catch (err) {
      console.error('Error fetching property:', err);
      setError(err instanceof Error ? err.message : t.errorFetch);
    } finally {
      setLoading(false);
    }
  }, [t.errorFetch]);

  // ========== WATCH ROUTER QUERY ==========
  useEffect(() => {
    if (!router.isReady) return;
    const id = router.query.propertyId as string;
    if (id) {
      fetchData(id);
    } else {
      setError('Property ID not found in URL');
      setLoading(false);
    }
  }, [router.isReady, router.query.propertyId, fetchData]);

  // ========== SET DATES FROM URL ==========
  useEffect(() => {
    if (router.isReady) {
      if (checkIn) setCheckInDate(new Date(checkIn as string));
      if (checkOut) setCheckOutDate(new Date(checkOut as string));
    }
  }, [router.isReady, checkIn, checkOut]);

  // ========== CALCULATE TOTAL PRICE ==========
  useEffect(() => {
    if (!checkInDate || !checkOutDate || !property) {
      setTotalPrice(0);
      return;
    }

    const nights = Math.ceil(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (nights <= 0) {
      setTotalPrice(0);
      return;
    }

    const basePrice = property.directPrice || property.price || 0;
    const directDiscount = property.directDiscount || 0;
    const propertyType = property.propertyType || '';
    const roomType = property.roomType || '';

    let total = 0;

    for (let i = 0; i < nights; i++) {
      const currentDate: Date = new Date(checkInDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
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

  // ========== PHONE VALIDATION ==========
  const isPhoneValid = (value: string): boolean => {
    if (!value) return false;
    return validatePhoneNumber(value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatPhoneDisplay(raw);
    setPhone(formatted);
    if (formatted && !validatePhoneNumber(formatted)) {
      setPhoneError(t.invalidPhone);
    } else {
      setPhoneError(null);
    }
  };

  // ========== FILE HANDLING ==========
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t.errorFileType);
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.errorFileSize);
      e.target.value = '';
      return;
    }

    setProofFile(file);
    const preview = URL.createObjectURL(file);
    setProofPreview(preview);
  };

  const removeFile = () => {
    setProofFile(null);
    if (proofPreview) {
      URL.revokeObjectURL(proofPreview);
      setProofPreview(null);
    }
  };

  // ========== COPY ACCOUNT ==========
  const copyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccount(accountNumber);
    toast.success(t.copied);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  // ========== VOUCHER HANDLING ==========
  const handleVoucherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setVoucherCode(raw);
    setVoucherError(null);
    if (voucherApplied) {
      setVoucherApplied(false);
      setVoucherDiscount(0);
      setAppliedVoucherId(null);
    }
  };

  const applyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError('Masukkan kode voucher');
      return;
    }
    if (voucherApplied) {
      toast.info('Voucher sudah diterapkan');
      return;
    }
    if (!management) {
      toast.error('Data management tidak ditemukan');
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherError(null);

    try {
      const vouchersRef = collection(db, 'management', management.id, 'vouchers');
      const q = query(vouchersRef, where('code', '==', voucherCode));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setVoucherError(t.voucherNotFound);
        toast.error(t.voucherNotFound);
        setIsApplyingVoucher(false);
        return;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const voucher: Voucher = {
        id: docSnap.id,
        code: data.code,
        discountType: data.discountType || 'percentage',
        discountValue: data.discountValue || 0,
        appliesTo: data.appliesTo || 'all',
        startDate: data.startDate?.toDate?.() || null,
        endDate: data.endDate?.toDate?.() || null,
        usageLimit: data.usageLimit || 0,
        usageCount: data.usageCount || 0,
        isActive: data.isActive !== false,
      };

      const now = new Date();

      if (!voucher.isActive) {
        setVoucherError(t.voucherInactive);
        toast.error(t.voucherInactive);
        setIsApplyingVoucher(false);
        return;
      }

      if (voucher.startDate && voucher.startDate > now) {
        setVoucherError('Voucher belum aktif');
        toast.error('Voucher belum aktif');
        setIsApplyingVoucher(false);
        return;
      }

      if (voucher.endDate && voucher.endDate < now) {
        setVoucherError(t.voucherExpired);
        toast.error(t.voucherExpired);
        setIsApplyingVoucher(false);
        return;
      }

      if (voucher.usageLimit > 0 && voucher.usageCount >= voucher.usageLimit) {
        setVoucherError(t.voucherLimitReached);
        toast.error(t.voucherLimitReached);
        setIsApplyingVoucher(false);
        return;
      }

      if (voucher.appliesTo !== 'all' && property) {
        const allowedProperties = voucher.appliesTo as string[];
        if (!allowedProperties.includes(property.id)) {
          setVoucherError('Voucher tidak berlaku untuk properti ini');
          toast.error('Voucher tidak berlaku untuk properti ini');
          setIsApplyingVoucher(false);
          return;
        }
      }

      const subtotal = totalPrice + adminFee;
      let discountAmount = 0;

      if (voucher.discountType === 'percentage') {
        discountAmount = Math.round(subtotal * (voucher.discountValue / 100));
      } else {
        discountAmount = Math.min(voucher.discountValue, subtotal);
      }

      setVoucherDiscount(discountAmount);
      setVoucherApplied(true);
      setAppliedVoucherId(voucher.id);
      setVoucherType(voucher.discountType);

      toast.success(`Voucher berhasil! Diskon ${formatCurrency(discountAmount)}`);

    } catch (err) {
      console.error('Error applying voucher:', err);
      setVoucherError('Terjadi kesalahan, coba lagi');
      toast.error('Gagal menerapkan voucher');
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherCode('');
    setVoucherDiscount(0);
    setVoucherApplied(false);
    setVoucherError(null);
    setAppliedVoucherId(null);
    toast.info('Voucher dihapus');
  };

  // ========== SUBMIT PAYMENT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isExpired) {
      toast.error(t.sessionExpired);
      return;
    }

    if (!fullName || !email || !phone) {
      toast.error(t.errorCompleteFields);
      return;
    }

    if (!isPhoneValid(phone)) {
      toast.error(t.invalidPhone);
      return;
    }

    if (!proofFile) {
      toast.error(t.errorUpload);
      return;
    }

    if (!agreeTerms) {
      toast.error(t.errorTerms);
      return;
    }

    if (!property || !management) {
      toast.error('Data properti tidak lengkap');
      return;
    }

    setSubmitting(true);

    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const fileName = `public_payment_${timestamp}_${proofFile.name}`;
      const storageRef = ref(
        storage,
        `public_payments/${management.id}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`
      );
      await uploadBytes(storageRef, proofFile);
      const proofUrl = await getDownloadURL(storageRef);

      const totalNights = Math.ceil(
        Math.abs(checkOutDate!.getTime() - checkInDate!.getTime()) / (1000 * 60 * 60 * 24)
      );
      const pricePerNight = property.directPrice || property.price;
      const subtotal = pricePerNight * totalNights;
      const adminFeeAmount = management.adminFee || 2500;
      const totalWithFee = subtotal + adminFeeAmount - voucherDiscount;

      if (voucherApplied && appliedVoucherId) {
        const voucherRef = doc(db, 'management', management.id, 'vouchers', appliedVoucherId);
        await updateDoc(voucherRef, {
          usageCount: (await getDoc(voucherRef)).data()?.usageCount + 1 || 1,
          updatedAt: serverTimestamp(),
        });
      }

      const bookingData = {
        propertyID: property.id,
        managementID: management.id,
        source: 'direct',
        status: 'pending_public',
        paymentStatus: 'Pending Verification',
        publicCustomerName: fullName,
        publicCustomerEmail: email,
        publicCustomerPhone: phone,
        notes: notes || '',
        paymentProofUrl: proofUrl,
        totalPrice: subtotal,
        adminFee: adminFeeAmount,
        voucherCode: voucherApplied ? voucherCode : null,
        voucherDiscount: voucherDiscount,
        voucherId: appliedVoucherId,
        voucherType: voucherType,
        totalWithFee: totalWithFee,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        totalNights: totalNights,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cleaned: false,
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);

      await addDoc(collection(db, 'notifications'), {
        type: 'public_booking',
        title: language === 'id' ? 'Booking Publik Baru' : 'New Public Booking',
        message: language === 'id'
          ? `${fullName} telah melakukan booking untuk ${property.name}`
          : `${fullName} has booked ${property.name}`,
        userId: management.id,
        userType: 'management',
        managementId: management.id,
        bookingId: bookingRef.id,
        read: false,
        createdAt: serverTimestamp(),
      });

      toast.success(t.success);
      setTimeout(() => {
        router.push(`/payment/success?bookingId=${bookingRef.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error submitting payment:', err);
      toast.error(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== THEME (EXROOM - Urban Blue) ==========
  const bgDark = isDarkMode ? 'bg-[#081120]' : 'bg-[#F8FAFC]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#0F172A]';
  const textSecondary = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';
  const borderColor = isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]';
  const brandColor = property?.managementBrandColor || '#21409A';
  
  const displayPrice = property?.directPrice || property?.price || 0;
  const displayDiscount = property?.directDiscount || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isFormValid = () => {
    return (
      fullName &&
      email &&
      phone &&
      isPhoneValid(phone) &&
      proofFile &&
      agreeTerms &&
      !isExpired &&
      !submitting
    );
  };

  // Cek apakah ada special date dalam rentang yang dipilih
  const hasSpecialDate = ((): boolean => {
    if (!checkInDate || !checkOutDate || !property) return false;
    const nights = Math.ceil(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    for (let i = 0; i < nights; i++) {
      const d: Date = new Date(checkInDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      if (specialDatePricing?.[dateStr]?.[property.propertyType || '']?.[property.roomType || '']) {
        return true;
      }
    }
    return false;
  })();

  const hasSaturdayPrice = ((): boolean => {
    if (!checkInDate || !checkOutDate || !saturdayPricingMode) return false;
    const nights = Math.ceil(
      Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    for (let i = 0; i < nights; i++) {
      const d: Date = new Date(checkInDate);
      d.setDate(d.getDate() + i);
      if (d.getDay() === 6) return true;
    }
    return false;
  })();

  // ========== RENDER ==========
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgDark}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !property || !management) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgDark} p-4`}>
        <div className="text-center max-w-md">
          <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Oops!</h1>
          <p className={`${textSecondary} mb-6`}>{error || 'Data tidak ditemukan'}</p>
          <Link href="/properties">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#21409A] text-white rounded-xl hover:bg-[#4F7DFF] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              {t.backToProperty}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalNights = checkInDate && checkOutDate
    ? Math.ceil(Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const adminFeeAmount = management.adminFee || 2500;
  const totalWithFee = totalPrice + adminFeeAmount - voucherDiscount;

  return (
    <div className={`min-h-screen ${bgDark} transition-colors duration-300 overflow-x-hidden`}>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="top-right" autoClose={3000} />

      {/* ========== NAVBAR (diperbaiki) ========== */}
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

      {/* ========== TIMEOUT WARNING BANNER ========== */}
      <AnimatePresence>
        {!isExpired && timeRemaining < 300 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 md:top-20 left-0 right-0 z-40 p-3 bg-red-500/90 backdrop-blur-sm text-white text-center font-medium flex items-center justify-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <span>
              {t.timeoutWarning
                .replace('{minutes}', Math.floor(timeRemaining / 60).toString())
                .replace('{seconds}', (timeRemaining % 60).toString())}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MAIN CONTENT ========== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/property/${property.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-xl shadow-sm hover:shadow-md transition-all border ${borderColor}`}
              >
                <ArrowLeft className={`w-4 h-4 ${textPrimary}`} />
                <span className={`text-sm ${textPrimary}`}>{t.backToProperty}</span>
              </motion.button>
            </Link>
            <div>
              <h1 className={`text-2xl md:text-3xl font-light ${textPrimary} tracking-tight`}>{t.title}</h1>
              <p className={`text-sm ${textSecondary}`}>{t.subtitle}</p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
            isExpired
              ? 'bg-red-500/20 text-red-500 border border-red-500/30'
              : timeRemaining < 300
              ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
              : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
          }`}>
            <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : timeRemaining < 300 ? 'text-yellow-500' : 'text-emerald-500'}`} />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {isExpired ? (
          <div className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-8 text-center border ${borderColor}`}>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>{t.timeoutTitle}</h2>
            <p className={textSecondary}>{t.timeoutMessage}</p>
            <Link href={`/property/${property.id}`}>
              <button className="mt-4 px-6 py-2 bg-[#21409A] text-white rounded-xl hover:bg-[#4F7DFF] transition">
                {t.backToProperty}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ====== LEFT: PAYMENT FORM ====== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Home className="w-5 h-5 text-[#4F7DFF]" />
                  {t.property}
                </h2>
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    {property.photoURLs.length > 0 ? (
                      <Image
                        src={property.photoURLs[0]}
                        alt={property.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${textPrimary}`}>{property.name}</h3>
                    <div className={`flex items-center gap-1 text-sm ${textSecondary}`}>
                      <MapPin className="w-3 h-3" />
                      <span>{property.city}, {property.country}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className={textSecondary}>
                        <Bed className="w-3 h-3 inline mr-1" />
                        {property.bedrooms || 1}
                      </span>
                      <span className={textSecondary}>
                        <Bath className="w-3 h-3 inline mr-1" />
                        {property.bathrooms || 1}
                      </span>
                      <span className={textSecondary}>
                        <Building2 className="w-3 h-3 inline mr-1" />
                        {property.roomType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <p className={`text-lg font-bold ${textPrimary}`}>
                        {formatCurrency(displayPrice)} {t.perNight}
                      </p>
                      {displayDiscount > 0 && (
                        <span className={`text-xs ${textSecondary}`}>
                          (diskon {displayDiscount}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bank Accounts */}
              {management.bankAccounts && management.bankAccounts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
                >
                  <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                    <CreditCard className="w-5 h-5 text-[#4F7DFF]" />
                    {t.bankAccounts}
                  </h2>
                  <p className={`text-sm ${textSecondary} mb-3`}>{t.transferTo}</p>
                  <div className="space-y-3">
                    {management.bankAccounts.map((account, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} transition-all hover:border-[#4F7DFF]/50`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className={`font-semibold ${textPrimary}`}>{account.bankName}</p>
                            <p className={`text-sm ${textSecondary} font-mono`}>{account.accountNumber}</p>
                            <p className={`text-xs ${textSecondary}`}>a.n. {account.accountHolderName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyAccountNumber(account.accountNumber)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1 ${
                              copiedAccount === account.accountNumber
                                ? 'bg-emerald-500 text-white'
                                : 'bg-[#4F7DFF] text-white hover:bg-[#21409A]'
                            }`}
                          >
                            {copiedAccount === account.accountNumber ? (
                              <>
                                <CheckCircleIcon className="w-3 h-3" />
                                {t.copied}
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                {t.copyAccount}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 p-4 rounded-xl ${isDarkMode ? 'bg-[#21409A]/10' : 'bg-[#4F7DFF]/10'} border border-[#4F7DFF]/20`}>
                    <p className={`text-sm font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                      <Info className="w-4 h-4 text-[#4F7DFF]" />
                      {t.paymentInstructions}
                    </p>
                    <ul className={`text-sm ${textSecondary} space-y-1`}>
                      <li>{t.instruction1}</li>
                      <li>{t.instruction2}</li>
                      <li>{t.instruction3}</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <div className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor}`}>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <AlertCircle className="w-5 h-5" />
                    <span className={`text-sm ${textSecondary}`}>{t.noBankAccounts}</span>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Users className="w-5 h-5 text-[#4F7DFF]" />
                  Informasi Pemesan
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Masukkan nama lengkap Anda"
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent transition-all`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@contoh.com"
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent transition-all`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder={t.phonePlaceholder}
                        className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent transition-all ${
                          phoneError ? 'border-red-500 ring-2 ring-red-500' : ''
                        }`}
                        required
                      />
                      {phoneError && (
                        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                      )}
                      <p className={`text-xs ${textSecondary} mt-1`}>
                        Contoh: +62 8123456789 atau +628123456789
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-1`}>Catatan Tambahan (Opsional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tulis catatan untuk manajemen properti..."
                      rows={3}
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent transition-all resize-none`}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ========== VOUCHER SECTION ========== */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Ticket className="w-5 h-5 text-pink-500" />
                  {t.voucher}
                </h2>
                <p className={`text-sm ${textSecondary} mb-3`}>{t.voucherNote}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={handleVoucherChange}
                      placeholder={t.voucherPlaceholder}
                      className={`w-full px-4 py-3 ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent uppercase transition-all`}
                      disabled={voucherApplied}
                      maxLength={20}
                    />
                    {voucherError && (
                      <p className="text-xs text-red-500 mt-1">{voucherError}</p>
                    )}
                  </div>
                  {voucherApplied ? (
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {t.voucherRemove}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={applyVoucher}
                      disabled={!voucherCode.trim() || isApplyingVoucher}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isApplyingVoucher ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Percent className="w-4 h-4" />
                          {t.voucherApply}
                        </>
                      )}
                    </button>
                  )}
                </div>
                {voucherApplied && voucherDiscount > 0 && (
                  <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    <span className={`text-sm text-emerald-400`}>
                      Diskon {formatCurrency(voucherDiscount)} berhasil diterapkan
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Upload Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <h2 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center gap-2`}>
                  <Upload className="w-5 h-5 text-[#4F7DFF]" />
                  {t.uploadProof}
                </h2>

                {proofPreview ? (
                  <div className="relative">
                    <div className="relative w-full max-w-xs h-48 rounded-xl overflow-hidden border-2 border-emerald-500/50">
                      <Image
                        src={proofPreview}
                        alt="Bukti pembayaran"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className={`text-sm text-emerald-500 mt-2 flex items-center gap-1`}>
                      <CheckCircleIcon className="w-4 h-4" />
                      {t.fileSelected.replace('{name}', proofFile?.name || '')}
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={`mt-2 text-sm ${textSecondary} hover:${textPrimary} underline transition`}
                    >
                      {t.changeFile}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${borderColor} rounded-xl cursor-pointer hover:border-[#4F7DFF] transition-all group`}
                    >
                      <div className="w-16 h-16 rounded-full bg-[#4F7DFF]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-[#4F7DFF]" />
                      </div>
                      <p className={`text-sm font-medium ${textPrimary}`}>{t.uploadHere}</p>
                      <p className={`text-xs ${textSecondary} mt-1`}>{t.dragDrop}</p>
                      <p className={`text-xs ${textSecondary} mt-2`}>{t.supportedFormats}</p>
                    </label>
                  </div>
                )}
              </motion.div>

              {/* Terms & Submit */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-6 border ${borderColor} shadow-lg`}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#4F7DFF] focus:ring-[#4F7DFF]"
                  />
                  <span className={`text-sm ${textSecondary}`}>{t.termsText}</span>
                </label>

                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className={`w-full mt-4 py-3.5 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 ${
                    isFormValid()
                      ? 'hover:shadow-lg hover:shadow-[#21409A]/30 hover:scale-[1.02]'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: isFormValid() ? brandColor : '#6B7280' }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t.submitPayment}
                    </>
                  )}
                </button>
              </motion.div>
            </div>

            {/* ====== RIGHT: SUMMARY ====== */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`${isDarkMode ? 'bg-[#101827]/90' : 'bg-white/90'} backdrop-blur-xl rounded-2xl p-6 border ${borderColor} shadow-2xl`}
                >
                  <div className="w-12 h-1 bg-gradient-to-r from-[#21409A] to-[#4F7DFF] rounded-full mb-4" />
                  <h3 className={`text-xl font-semibold ${textPrimary} mb-4`}>{t.bookingSummary}</h3>

                  <div className="space-y-3">
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${textSecondary}`}>Properti</p>
                      <p className={`font-medium ${textPrimary}`}>{property.name}</p>
                      <p className={`text-sm ${textSecondary}`}>{property.city}, {property.country}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < 4 ? 'text-[#4F7DFF] fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                        <span className={`text-xs ${textSecondary} ml-1`}>(4.8)</span>
                      </div>
                    </div>

                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${textSecondary}`}>Unit</p>
                      <p className={`font-medium ${textPrimary}`}>{property.unitNumber}</p>
                    </div>

                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#1a1a2e]' : 'bg-gray-50'}`}>
                      <p className={`text-xs ${textSecondary}`}>Tipe Kamar</p>
                      <p className={`font-medium ${textPrimary}`}>{property.roomType}</p>
                    </div>
                  </div>

                  {checkInDate && checkOutDate && (
                    <div className={`mt-4 pt-4 border-t ${borderColor} space-y-2`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={textSecondary}>
                          <Calendar className="w-4 h-4 inline mr-1 text-[#4F7DFF]" />
                          Check-in
                        </span>
                        <span className={`font-medium ${textPrimary}`}>
                          {checkInDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={textSecondary}>
                          <Calendar className="w-4 h-4 inline mr-1 text-[#4F7DFF]" />
                          Check-out
                        </span>
                        <span className={`font-medium ${textPrimary}`}>
                          {checkOutDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className={textSecondary}>Malam</span>
                        <span className={`font-medium ${textPrimary}`}>{totalNights}</span>
                      </div>
                    </div>
                  )}

                  <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                    <div className="flex justify-between mb-2">
                      <span className={textSecondary}>Total Harga</span>
                      <span className={`font-bold ${textPrimary}`}>
                        {formatCurrency(displayPrice)} x {totalNights} malam
                        {(hasSpecialDate || hasSaturdayPrice) && (
                          <span className="ml-1 text-xs text-[#4F7DFF]">
                            {hasSpecialDate ? '✨' : ''}
                            {hasSaturdayPrice ? '📈' : ''}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className={textSecondary}>Biaya Admin</span>
                      <span className={`font-bold ${textPrimary}`}>{formatCurrency(adminFeeAmount)}</span>
                    </div>
                    {voucherApplied && voucherDiscount > 0 && (
                      <div className="flex justify-between mb-2 text-emerald-400">
                        <span className={textSecondary}>{t.voucherDiscount}</span>
                        <span className="font-bold text-emerald-400">- {formatCurrency(voucherDiscount)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                      <span className={`text-lg font-bold ${textPrimary}`}>{t.totalPayment}</span>
                      <span className={`text-lg font-bold text-[#4F7DFF]`}>
                        {formatCurrency(totalWithFee)}
                      </span>
                    </div>
                    {(hasSpecialDate || hasSaturdayPrice) && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {hasSpecialDate && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            <Tag className="w-3 h-3" />
                            {t.specialPrice}
                          </span>
                        )}
                        {hasSaturdayPrice && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            <Percent className="w-3 h-3" />
                            {t.saturdayPrice}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========== FOOTER ========== */}
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
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #1a1a2e inset !important;
          -webkit-text-fill-color: white !important;
        }
        .dark input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #1a1a2e inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
}