// src\pages\booking\page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebaseConfig';
import { formatCurrency } from '@/pages/utils/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Home,
  Bed,
  Bath,
  User,
  Mail,
  Phone,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Moon,
  Sun,
  Globe,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Info,
  CreditCard,
  Send,
  Image as ImageIcon,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '@/pages/components/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ========== TYPES ==========
interface BankAccount {
  accountNumber: string;
  bankName: string;
  accountHolderName: string;
}

interface Property {
  id: string;
  name: string;
  unitNumber: string;
  city: string;
  country: string;
  price: number;
  directPrice?: number;
  photoURLs: string[];
  propertyType: string;
  roomType: string;
  floor: number;
  tower: string;
  availability: string;
  bedrooms?: number;
  bathrooms?: number;
  facilities?: string[];
  managementID?: string;
  managementName?: string;
  managementBrandColor?: string;
  description?: string;
}

interface Management {
  id: string;
  managementName: string;
  brandName?: string;
  brandLogo?: string;
  brandColor?: string;
  contactInfo?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  bankAccounts?: BankAccount[];
  disabledBookingDates?: string[];
  bookingWindowDays?: number;
}

type Language = 'id' | 'en';

// ========== TRANSLATIONS ==========
const translations = {
  id: {
    title: 'Pesan Properti',
    subtitle: 'Lengkapi data di bawah untuk melakukan pemesanan',
    backToProperty: 'Kembali ke Detail Properti',
    bookingDetails: 'Detail Pemesanan',
    property: 'Properti',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Malam',
    totalPrice: 'Total Harga',
    yourInformation: 'Informasi Anda',
    fullName: 'Nama Lengkap',
    fullNamePlaceholder: 'Masukkan nama lengkap Anda',
    email: 'Alamat Email',
    emailPlaceholder: 'email@contoh.com',
    phone: 'Nomor WhatsApp',
    phonePlaceholder: '08123456789',
    notes: 'Catatan Tambahan (Opsional)',
    notesPlaceholder: 'Tulis catatan untuk manajemen properti...',
    uploadProof: 'Upload Bukti Pembayaran',
    uploadProofDesc: 'Upload screenshot atau foto bukti transfer pembayaran (max 2MB, JPG/PNG)',
    preview: 'Pratinjau',
    terms: 'Saya menyetujui syarat & ketentuan yang berlaku',
    submitBooking: 'Kirim Pemesanan',
    submitting: 'Memproses...',
    success: 'Pemesanan berhasil! Menunggu konfirmasi dari manajemen.',
    error: 'Gagal memproses pemesanan. Silakan coba lagi.',
    errorCompleteFields: 'Harap lengkapi semua field yang wajib diisi.',
    errorUpload: 'Harap unggah bukti pembayaran.',
    errorTerms: 'Harap setujui syarat & ketentuan.',
    errorFileType: 'Hanya file PNG, JPG, atau JPEG yang diperbolehkan.',
    errorFileSize: 'Ukuran file tidak boleh melebihi 2MB.',
    propertyUnavailable: 'Properti tidak tersedia untuk tanggal yang dipilih.',
    loading: 'Memuat...',
    errorFetch: 'Gagal memuat data properti',
    retry: 'Coba Lagi',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    language: 'Bahasa',
    bankAccounts: 'Rekening Bank Tujuan',
    noBankAccounts: 'Belum ada rekening bank yang terdaftar. Hubungi manajemen properti.',
    transferTo: 'Transfer ke rekening di bawah ini:',
    copyAccount: 'Salin Nomor Rekening',
    copied: 'Tersalin!',
    paymentInstructions: 'Instruksi Pembayaran',
    instruction1: '1. Transfer sesuai nominal total ke rekening bank di atas',
    instruction2: '2. Upload bukti transfer pada form di bawah',
    instruction3: '3. Tunggu konfirmasi dari manajemen (maksimal 1x24 jam)',
    totalPayment: 'Total Pembayaran',
    bookingFee: 'Biaya Admin',
    adminFee: 'Biaya Admin',
    paymentProof: 'Bukti Pembayaran',
    uploadHere: 'Upload di sini',
    dragDrop: 'Seret & lepas atau klik untuk upload',
    supportedFormats: 'Format didukung: JPG, PNG, JPEG',
    fileSelected: 'File terpilih: {name}',
    changeFile: 'Ganti File',
    termsText: 'Dengan mengklik "Kirim Pemesanan", Anda menyetujui bahwa data Anda akan diproses sesuai dengan kebijakan privasi kami.',
    perNight: '/malam',
    unit: 'Unit',
    roomType: 'Tipe Kamar',
    bedrooms: 'Kamar Tidur',
    bathrooms: 'Kamar Mandi',
    dateBlocked: 'Tanggal ini diblokir oleh manajemen',
    bookingWindowWarning: 'Booking hanya bisa untuk {days} hari ke depan',
    propertyAlreadyBooked: 'Properti sudah dipesan untuk tanggal ini',
    invalidDates: 'Tanggal tidak valid. Check-out harus setelah check-in.',
  },
  en: {
    title: 'Book Property',
    subtitle: 'Complete the form below to make a booking',
    backToProperty: 'Back to Property Detail',
    bookingDetails: 'Booking Details',
    property: 'Property',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'Nights',
    totalPrice: 'Total Price',
    yourInformation: 'Your Information',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Enter your full name',
    email: 'Email Address',
    emailPlaceholder: 'email@example.com',
    phone: 'WhatsApp Number',
    phonePlaceholder: '08123456789',
    notes: 'Additional Notes (Optional)',
    notesPlaceholder: 'Write notes for property management...',
    uploadProof: 'Upload Payment Proof',
    uploadProofDesc: 'Upload screenshot or photo of payment transfer (max 2MB, JPG/PNG)',
    preview: 'Preview',
    terms: 'I agree to the terms & conditions',
    submitBooking: 'Submit Booking',
    submitting: 'Processing...',
    success: 'Booking submitted! Waiting for management confirmation.',
    error: 'Failed to process booking. Please try again.',
    errorCompleteFields: 'Please complete all required fields.',
    errorUpload: 'Please upload payment proof.',
    errorTerms: 'Please agree to the terms & conditions.',
    errorFileType: 'Only PNG, JPG, or JPEG files are allowed.',
    errorFileSize: 'File size must not exceed 2MB.',
    propertyUnavailable: 'Property is not available for the selected dates.',
    loading: 'Loading...',
    errorFetch: 'Failed to load property data',
    retry: 'Retry',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    bankAccounts: 'Destination Bank Accounts',
    noBankAccounts: 'No bank accounts registered. Contact property management.',
    transferTo: 'Transfer to the following bank account:',
    copyAccount: 'Copy Account Number',
    copied: 'Copied!',
    paymentInstructions: 'Payment Instructions',
    instruction1: '1. Transfer the total amount to the bank account above',
    instruction2: '2. Upload the transfer proof in the form below',
    instruction3: '3. Wait for management confirmation (max 1x24 hours)',
    totalPayment: 'Total Payment',
    bookingFee: 'Admin Fee',
    adminFee: 'Admin Fee',
    paymentProof: 'Payment Proof',
    uploadHere: 'Upload here',
    dragDrop: 'Drag & drop or click to upload',
    supportedFormats: 'Supported formats: JPG, PNG, JPEG',
    fileSelected: 'File selected: {name}',
    changeFile: 'Change File',
    termsText: 'By clicking "Submit Booking", you agree that your data will be processed in accordance with our privacy policy.',
    perNight: '/night',
    unit: 'Unit',
    roomType: 'Room Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    dateBlocked: 'This date is blocked by management',
    bookingWindowWarning: 'Bookings only allowed for the next {days} days',
    propertyAlreadyBooked: 'This property is already booked for these dates',
    invalidDates: 'Invalid dates. Check-out must be after check-in.',
  }
};

const ADMIN_FEE = 2500;

// ========== CHECK ICON COMPONENT ==========
const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// ========== COPY ICON COMPONENT ==========
const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
  </svg>
);

// ========== MAIN COMPONENT ==========
export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  // ========== STATE ==========
  const [property, setProperty] = useState<Property | null>(null);
  const [management, setManagement] = useState<Management | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // 🔥 Tanggal dari URL - Hanya baca (tidak perlu setter)
  const checkInDate = useMemo(() => 
    checkInParam ? new Date(checkInParam) : null
  , [checkInParam]);

  const checkOutDate = useMemo(() => 
    checkOutParam ? new Date(checkOutParam) : null
  , [checkOutParam]);

  // ========== FORM STATE ==========
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // ========== UI ==========
  const [language, setLanguage] = useState<Language>('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // ========== VALIDATE AVAILABILITY ==========
  const validateAvailability = useCallback(async (checkIn: Date, checkOut: Date): Promise<{ valid: boolean; message?: string }> => {
    if (!checkIn || !checkOut) {
      return { valid: false, message: 'Silakan pilih tanggal check-in dan check-out' };
    }

    if (checkIn >= checkOut) {
      return { valid: false, message: t.invalidDates };
    }

    if (!property || !management) {
      return { valid: false, message: 'Data properti tidak lengkap' };
    }

    try {
      // 1. Cek disabled dates management
      if (management.disabledBookingDates) {
        const checkInStr = checkIn.toISOString().split('T')[0];
        if (management.disabledBookingDates.includes(checkInStr)) {
          return { valid: false, message: t.dateBlocked };
        }
      }

      // 2. Cek booking window
      if (management.bookingWindowDays) {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + management.bookingWindowDays);
        if (checkIn > maxDate) {
          return { 
            valid: false, 
            message: t.bookingWindowWarning.replace('{days}', management.bookingWindowDays.toString()) 
          };
        }
      }

      // 3. Cek double booking (Pending Verification + Paid)
      const q = query(
        collection(db, 'bookings'),
        where('propertyID', '==', property.id),
        where('checkOutDate', '>', checkIn),
        where('checkInDate', '<', checkOut),
        where('paymentStatus', 'in', ['Pending Verification', 'Paid'])
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        return { valid: false, message: t.propertyAlreadyBooked };
      }

      return { valid: true };
    } catch (err) {
      console.error('Error validating availability:', err);
      return { valid: false, message: t.errorFetch };
    }
  }, [property, management, t]);

  // ========== FETCH DATA ==========
  const fetchData = useCallback(async () => {
    if (!propertyId) {
      setError('Property ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setDateError(null);

    try {
      // 1. Fetch property
      const propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      if (!propertyDoc.exists()) {
        setError('Property not found');
        setLoading(false);
        return;
      }

      const data = propertyDoc.data();

      if (data.availability !== 'available') {
        setError(t.propertyUnavailable);
        setLoading(false);
        return;
      }

      const propertyData: Property = {
        id: propertyDoc.id,
        name: data.name || 'Property',
        unitNumber: data.unitNumber || '',
        city: data.city || '',
        country: data.country || 'Indonesia',
        price: data.price || 0,
        directPrice: data.directPrice || 0,
        photoURLs: data.photoURLs || [],
        propertyType: data.propertyType || 'Apartment',
        roomType: data.roomType || '',
        floor: data.floor || 0,
        tower: data.tower || '',
        availability: data.availability || 'available',
        bedrooms: data.bedrooms || 1,
        bathrooms: data.bathrooms || 1,
        facilities: data.facilities || [],
        managementID: data.managementID,
        managementName: data.managementName || '',
        managementBrandColor: data.managementBrandColor || '#4F46E5',
        description: data.description || '',
      };

      setProperty(propertyData);

      // 2. Fetch management info
      if (data.managementID) {
        const mgmtDoc = await getDoc(doc(db, 'management', data.managementID));
        if (mgmtDoc.exists()) {
          const mgmtData = mgmtDoc.data();
          setManagement({
            id: mgmtDoc.id,
            managementName: mgmtData.managementName || 'Management',
            brandName: mgmtData.brandName || mgmtData.managementName,
            brandLogo: mgmtData.brandLogo || '',
            brandColor: mgmtData.brandColor || '#4F46E5',
            contactInfo: mgmtData.contactInfo || '',
            phoneNumber: mgmtData.phoneNumber || '',
            whatsappNumber: mgmtData.whatsappNumber || '',
            bankAccounts: mgmtData.bankAccounts || [],
            disabledBookingDates: mgmtData.disabledBookingDates || [],
            bookingWindowDays: mgmtData.bookingWindowDays || 30,
          });
        }
      }

      // 3. Validate dates if provided
      if (checkInDate && checkOutDate && propertyData) {
        const result = await validateAvailability(checkInDate, checkOutDate);
        if (!result.valid) {
          setDateError(result.message || null);
        }
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t.errorFetch);
    } finally {
      setLoading(false);
    }
  }, [propertyId, checkInDate, checkOutDate, validateAvailability, t.errorFetch, t.propertyUnavailable]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // ========== SUBMIT BOOKING ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi form
    if (!fullName || !email || !phone) {
      toast.error(t.errorCompleteFields);
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
      toast.error('Property or management data not loaded');
      return;
    }

    // Validasi tanggal
    if (!checkInDate || !checkOutDate) {
      toast.error('Silakan pilih tanggal check-in dan check-out');
      return;
    }

    // Validasi ketersediaan
    const validation = await validateAvailability(checkInDate, checkOutDate);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload file
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const fileName = `public_booking_${timestamp}_${proofFile.name}`;
      const storageRef = ref(
        storage,
        `public_booking_proofs/${management.id}/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`
      );
      await uploadBytes(storageRef, proofFile);
      const proofUrl = await getDownloadURL(storageRef);

      // 2. Hitung total
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Gunakan directPrice jika ada, fallback ke price
      const pricePerNight = property.directPrice || property.price;
      const totalPrice = pricePerNight * totalNights;
      const totalWithFee = totalPrice + ADMIN_FEE;

      // 3. Create booking document
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
        totalPrice: totalPrice,
        adminFee: ADMIN_FEE,
        totalWithFee: totalWithFee,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        totalNights: totalNights,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        cleaned: false,
      };

      const bookingRef = await addDoc(collection(db, 'bookings'), bookingData);

      // 4. Create notification for management
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

      // 5. Redirect to success page
      toast.success(t.success);
      setTimeout(() => {
        router.push(`/booking/success?bookingId=${bookingRef.id}`);
      }, 1500);

    } catch (err) {
      console.error('Error submitting booking:', err);
      toast.error(t.error);
    } finally {
      setSubmitting(false);
    }
  };

  // ========== THEME ==========
  const bgGradient = isDarkMode
    ? 'from-gray-900 via-gray-800 to-gray-900'
    : 'from-slate-50 via-blue-50 to-indigo-50';
  const cardBg = isDarkMode ? 'bg-gray-800/90' : 'bg-white/80';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
  const subTextColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const borderColor = isDarkMode ? 'border-gray-700' : 'border-gray-200';
  const inputBg = isDarkMode ? 'bg-gray-700' : 'bg-white';

  const brandColor = property?.managementBrandColor || '#4F46E5';
  const displayPrice = property?.directPrice || property?.price || 0;

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${bgGradient}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ========== ERROR ==========
  if (error || !property || !management) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${bgGradient} p-4`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className={`text-2xl font-bold ${textColor} mb-2`}>Oops!</h1>
          <p className={`${subTextColor} mb-6`}>{error || 'Property not found'}</p>
          <Link href="/">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalNights = checkInDate && checkOutDate
    ? Math.ceil(Math.abs(checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = displayPrice * totalNights;
  const totalWithFee = totalPrice + ADMIN_FEE;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-colors duration-300`}>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="top-right" autoClose={3000} />

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${isScrolled ? textColor : 'text-white'}`}>
                Ruangio
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-all ${isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/10'}`}
              >
                {isDarkMode ? (
                  <Sun className={`w-5 h-5 ${isScrolled ? textColor : 'text-white'}`} />
                ) : (
                  <Moon className={`w-5 h-5 ${isScrolled ? textColor : 'text-white'}`} />
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-1 ${isScrolled ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : 'hover:bg-white/10'}`}
                >
                  <Globe className={`w-5 h-5 ${isScrolled ? textColor : 'text-white'}`} />
                  <span className={`text-sm font-medium ${isScrolled ? textColor : 'text-white'}`}>
                    {language === 'id' ? 'ID' : 'EN'}
                  </span>
                </button>
                <AnimatePresence>
                  {showLangMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`absolute top-full right-0 mt-2 w-40 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl overflow-hidden border ${borderColor} z-50`}
                    >
                      <button
                        onClick={() => { setLanguage('id'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                      >
                        🇮🇩 Indonesia {language === 'id' && <CheckIcon className="w-4 h-4 text-green-500 ml-auto" />}
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textColor} hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-t ${borderColor}`}
                      >
                        🇬🇧 English {language === 'en' && <CheckIcon className="w-4 h-4 text-green-500 ml-auto" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ========== MAIN CONTENT ========== */}
      <div className="pt-16 md:pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/" className={`${subTextColor} hover:${textColor} transition-colors`}>
            Beranda
          </Link>
          <ChevronRight className={`w-4 h-4 ${subTextColor}`} />
          <Link href="/properties" className={`${subTextColor} hover:${textColor} transition-colors`}>
            Properti
          </Link>
          <ChevronRight className={`w-4 h-4 ${subTextColor}`} />
          <Link href={`/property/${property.id}`} className={`${subTextColor} hover:${textColor} transition-colors`}>
            {property.name}
          </Link>
          <ChevronRight className={`w-4 h-4 ${subTextColor}`} />
          <span className={textColor}>Booking</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-2xl md:text-3xl font-bold ${textColor} mb-2`}>
            {t.title}
          </h1>
          <p className={subTextColor}>{t.subtitle}</p>
          {dateError && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-sm text-red-400">{dateError}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ====== LEFT: FORM ====== */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Summary */}
              <div className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                  <Home className="w-5 h-5 text-blue-500" />
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
                    <h3 className={`font-semibold ${textColor}`}>{property.name}</h3>
                    <div className={`flex items-center gap-1 text-sm ${subTextColor}`}>
                      <MapPin className="w-3 h-3" />
                      <span>{property.city}, {property.country}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className={`${subTextColor}`}>
                        <Bed className="w-3 h-3 inline mr-1" />
                        {property.bedrooms || 1}
                      </span>
                      <span className={`${subTextColor}`}>
                        <Bath className="w-3 h-3 inline mr-1" />
                        {property.bathrooms || 1}
                      </span>
                      <span className={`${subTextColor}`}>
                        <Building2 className="w-3 h-3 inline mr-1" />
                        {property.roomType}
                      </span>
                    </div>
                    <p className={`text-lg font-bold mt-2`} style={{ color: brandColor }}>
                      {formatCurrency(displayPrice)} {t.perNight}
                      {property.directPrice && (
                        <span className="text-xs ml-2 bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-500">
                          Direct Price
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bank Accounts */}
              {management.bankAccounts && management.bankAccounts.length > 0 && (
                <div className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                  <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    {t.bankAccounts}
                  </h2>
                  <p className={`text-sm ${subTextColor} mb-3`}>{t.transferTo}</p>
                  <div className="space-y-3">
                    {management.bankAccounts.map((account, index) => (
                      <div key={index} className={`p-4 rounded-xl border ${borderColor} ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className={`font-semibold ${textColor}`}>{account.bankName}</p>
                            <p className={`text-sm ${subTextColor} font-mono`}>{account.accountNumber}</p>
                            <p className={`text-xs ${subTextColor}`}>a.n. {account.accountHolderName}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => copyAccountNumber(account.accountNumber)}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-all flex items-center gap-1 ${
                              copiedAccount === account.accountNumber
                                ? 'bg-emerald-500 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {copiedAccount === account.accountNumber ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                {t.copied}
                              </>
                            ) : (
                              <>
                                <CopyIcon className="w-3 h-3" />
                                {t.copyAccount}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} border border-blue-500/30`}>
                    <p className={`text-sm font-medium ${textColor} mb-2 flex items-center gap-2`}>
                      <Info className="w-4 h-4 text-blue-500" />
                      {t.paymentInstructions}
                    </p>
                    <ul className={`text-sm ${subTextColor} space-y-1`}>
                      <li>{t.instruction1}</li>
                      <li>{t.instruction2}</li>
                      <li>{t.instruction3}</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                  <User className="w-5 h-5 text-purple-500" />
                  {t.yourInformation}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${subTextColor} mb-1`}>
                      {t.fullName} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t.fullNamePlaceholder}
                        className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${subTextColor} mb-1`}>
                      {t.email} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${subTextColor} mb-1`}>
                      {t.phone} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.phonePlaceholder}
                        className={`w-full pl-10 pr-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${subTextColor} mb-1`}>{t.notes}</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.notesPlaceholder}
                      rows={3}
                      className={`w-full px-4 py-3 ${inputBg} border ${borderColor} rounded-xl ${textColor} placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* Upload Proof */}
              <div className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                <h2 className={`text-lg font-bold ${textColor} mb-4 flex items-center gap-2`}>
                  <Upload className="w-5 h-5 text-yellow-500" />
                  {t.uploadProof}
                </h2>

                {proofPreview ? (
                  <div className="relative">
                    <div className="relative w-full max-w-xs h-48 rounded-xl overflow-hidden border-2 border-emerald-500/50">
                      <Image
                        src={proofPreview}
                        alt="Payment proof preview"
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
                      <CheckCircle className="w-4 h-4" />
                      {t.fileSelected.replace('{name}', proofFile?.name || '')}
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className={`mt-2 text-sm ${subTextColor} hover:${textColor} underline transition`}
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
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed ${borderColor} rounded-xl cursor-pointer hover:border-blue-500 transition-all group`}
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-8 h-8 text-blue-500" />
                      </div>
                      <p className={`text-sm font-medium ${textColor}`}>{t.uploadHere}</p>
                      <p className={`text-xs ${subTextColor} mt-1`}>{t.dragDrop}</p>
                      <p className={`text-xs ${subTextColor} mt-2`}>{t.supportedFormats}</p>
                    </label>
                  </div>
                )}
              </div>

              {/* Terms & Submit */}
              <div className={`${cardBg} rounded-2xl p-6 border ${borderColor}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm ${subTextColor}`}>
                    {t.termsText}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting || !!dateError}
                  className={`w-full mt-4 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2 ${
                    submitting || dateError
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'hover:shadow-lg hover:scale-[1.02]'
                  }`}
                  style={{ backgroundColor: submitting || dateError ? '#6B7280' : brandColor }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {t.submitBooking}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ====== RIGHT: SUMMARY ====== */}
          <div className="lg:col-span-1">
            <div className={`${cardBg} rounded-2xl p-6 border ${borderColor} sticky top-24 shadow-lg`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>{t.bookingDetails}</h3>

              <div className="space-y-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${subTextColor}`}>{t.property}</p>
                  <p className={`font-medium ${textColor}`}>{property.name}</p>
                  <p className={`text-sm ${subTextColor}`}>{property.city}, {property.country}</p>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${subTextColor}`}>{t.unit}</p>
                  <p className={`font-medium ${textColor}`}>{property.unitNumber}</p>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${subTextColor}`}>{t.roomType}</p>
                  <p className={`font-medium ${textColor}`}>{property.roomType}</p>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${subTextColor}`}>{t.bedrooms}</p>
                  <p className={`font-medium ${textColor}`}>{property.bedrooms || 1}</p>
                </div>

                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs ${subTextColor}`}>{t.bathrooms}</p>
                  <p className={`font-medium ${textColor}`}>{property.bathrooms || 1}</p>
                </div>
              </div>

              {/* ✅ Tampilkan detail tanggal */}
              {checkInDate && checkOutDate && (
                <div className={`mt-4 pt-4 border-t ${borderColor} space-y-2`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={subTextColor}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t.checkIn}
                    </span>
                    <span className={`font-medium ${textColor}`}>
                      {checkInDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={subTextColor}>
                      <Calendar className="w-4 h-4 inline mr-1" />
                      {t.checkOut}
                    </span>
                    <span className={`font-medium ${textColor}`}>
                      {checkOutDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={subTextColor}>{t.nights}</span>
                    <span className={`font-medium ${textColor}`}>{totalNights}</span>
                  </div>
                </div>
              )}

              <div className={`mt-4 pt-4 border-t ${borderColor}`}>
                <div className="flex justify-between mb-2">
                  <span className={subTextColor}>Total Harga</span>
                  <span className={`font-bold ${textColor}`}>
                    {formatCurrency(displayPrice)} x {totalNights} malam
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className={subTextColor}>{t.adminFee}</span>
                  <span className={`font-bold ${textColor}`}>{formatCurrency(ADMIN_FEE)}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                  <span className={`text-lg font-bold ${textColor}`}>{t.totalPayment}</span>
                  <span className={`text-lg font-bold`} style={{ color: brandColor }}>
                    {formatCurrency(totalWithFee)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== FOOTER ========== */}
      <footer className={`border-t ${borderColor} py-8 px-4 sm:px-6 lg:px-8 mt-8`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm font-medium ${textColor}`}>
              © {new Date().getFullYear()} Ruangio
            </span>
          </div>
          <div className={`text-sm ${subTextColor}`}>
            Platform Manajemen Properti Terpercaya
          </div>
        </div>
      </footer>
    </div>
  );
}