// src/pages/properties.tsx
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  MapPin,
  Home,
  Bed,
  Bath,
  Search,
  Moon,
  Sun,
  Globe,
  ArrowRight,
  Layers,
  Star,
  ChevronDown,
  Menu,
  SlidersHorizontal,
  Grid3x3,
  List,
  AlertCircle,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Check,
  Info,
  Landmark,
  X,
  Crown,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { addDays } from 'date-fns';

// ========== TYPES ==========
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
  createdAt?: Date;
  description?: string;
  propertyLocationName?: string;
}

interface ManagementData {
  id: string;
  managementName: string;
  brandName?: string;
  brandLogo?: string;
  brandColor?: string;
  slug?: string;
  disabledBookingDates?: string[];
  bookingWindowDays?: number;
}

type Language = 'id' | 'en';
type ViewMode = 'grid' | 'list';
type SortBy = 'price_asc' | 'price_desc' | 'newest' | 'popular';

// ========== TRANSLATIONS ==========
const translations = {
  id: {
    title: 'Koleksi Residences Premium',
    subtitle: 'Temukan hunian eksklusif dengan standar kualitas tertinggi',
    searchPlaceholder: 'Cari properti, kota, atau tipe...',
    filter: 'Filter',
    clearFilters: 'Hapus Filter',
    sortBy: 'Urutkan',
    sortPriceLow: 'Harga Terendah',
    sortPriceHigh: 'Harga Tertinggi',
    sortNewest: 'Terbaru',
    sortPopular: 'Terpopuler',
    viewGrid: 'Grid',
    viewList: 'List',
    allProperties: 'Semua Residences',
    available: 'Tersedia',
    occupied: 'Terisi',
    perNight: '/malam',
    viewDetails: 'Lihat Detail',
    noProperties: 'Tidak ada residences ditemukan',
    noPropertiesDesc: 'Coba ubah filter atau pencarian Anda',
    propertiesFound: 'residences ditemukan',
    from: 'Dari',
    city: 'Kota',
    allCities: 'Semua Kota',
    propertyType: 'Tipe Properti',
    allTypes: 'Semua Tipe',
    roomType: 'Tipe Kamar',
    allRoomTypes: 'Semua Tipe Kamar',
    priceRange: 'Rentang Harga',
    minPrice: 'Harga Min',
    maxPrice: 'Harga Max',
    management: 'Manajemen',
    allManagements: 'Semua Manajemen',
    applyFilters: 'Terapkan Filter',
    resetFilters: 'Reset',
    loading: 'Memuat...',
    loadMore: 'Muat Lebih Banyak',
    loadingMore: 'Memuat...',
    errorFetch: 'Gagal memuat data',
    retry: 'Coba Lagi',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    language: 'Bahasa',
    backToHome: 'Kembali ke Beranda',
    bedrooms: 'Kamar Tidur',
    bathrooms: 'Kamar Mandi',
    floor: 'Lantai',
    tower: 'Menara',
    unit: 'Unit',
    facilities: 'Fasilitas',
    rating: 'Rating',
    noResults: 'Tidak ada hasil',
    noResultsDesc: 'Coba sesuaikan filter pencarian Anda',
    propertyLocation: 'Lokasi Properti',
    allLocations: 'Semua Lokasi',
    noLocations: 'Tidak ada data lokasi',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectCheckIn: 'Pilih Check-in',
    selectCheckOut: 'Pilih Check-out',
    selectDate: 'Pilih tanggal',
    bookingWindowTitle: 'Pembatasan Tanggal Booking',
    bookingWindowWarning: 'Booking hanya bisa untuk {days} hari ke depan',
    maxDateInfo: 'Maksimal tanggal check-in: {date}',
    dateBlocked: 'Tanggal ini diblokir oleh manajemen',
    propertyUnavailable: 'Properti tidak tersedia untuk tanggal yang dipilih',
    checkAvailability: 'Cek Ketersediaan',
    noAvailableProperties: 'Tidak ada properti yang tersedia untuk tanggal yang dipilih',
    noAvailablePropertiesDesc: 'Coba pilih tanggal lain untuk melihat properti yang tersedia.',
    resetDateFilter: 'Reset Tanggal',
    selectValidDate: 'Pilih tanggal dalam rentang yang diperbolehkan',
    applyDate: 'Terapkan Tanggal',
    dateRange: 'Rentang Tanggal',
    nights: 'Malam',
    total: 'Total',
    exploreNow: 'Jelajahi Sekarang',
    featured: 'Unggulan',
    ourProperties: 'Residences Kami',
    contactUs: 'Hubungi Kami',
    whyUs: 'Kenapa Bintang Property?',
    home: 'Beranda',
    properties: 'Residences',
    contact: 'Kontak',
    rights: 'Hak Cipta Dilindungi.',
  },
  en: {
    title: 'Premium Residences Collection',
    subtitle: 'Discover exclusive homes with the highest quality standards',
    searchPlaceholder: 'Search property, city, or type...',
    filter: 'Filter',
    clearFilters: 'Clear Filters',
    sortBy: 'Sort By',
    sortPriceLow: 'Price: Low to High',
    sortPriceHigh: 'Price: High to Low',
    sortNewest: 'Newest',
    sortPopular: 'Most Popular',
    viewGrid: 'Grid',
    viewList: 'List',
    allProperties: 'All Residences',
    available: 'Available',
    occupied: 'Occupied',
    perNight: '/night',
    viewDetails: 'View Details',
    noProperties: 'No residences found',
    noPropertiesDesc: 'Try adjusting your filters or search',
    propertiesFound: 'residences found',
    from: 'From',
    city: 'City',
    allCities: 'All Cities',
    propertyType: 'Property Type',
    allTypes: 'All Types',
    roomType: 'Room Type',
    allRoomTypes: 'All Room Types',
    priceRange: 'Price Range',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    management: 'Management',
    allManagements: 'All Managements',
    applyFilters: 'Apply Filters',
    resetFilters: 'Reset',
    loading: 'Loading...',
    loadMore: 'Load More',
    loadingMore: 'Loading...',
    errorFetch: 'Failed to load data',
    retry: 'Retry',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    backToHome: 'Back to Home',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    floor: 'Floor',
    tower: 'Tower',
    unit: 'Unit',
    facilities: 'Facilities',
    rating: 'Rating',
    noResults: 'No results found',
    noResultsDesc: 'Try adjusting your search filters',
    propertyLocation: 'Property Location',
    allLocations: 'All Locations',
    noLocations: 'No location data',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    selectCheckIn: 'Select Check-in',
    selectCheckOut: 'Select Check-out',
    selectDate: 'Select date',
    bookingWindowTitle: 'Date Restriction',
    bookingWindowWarning: 'Bookings only allowed for the next {days} days',
    maxDateInfo: 'Maximum check-in date: {date}',
    dateBlocked: 'This date is blocked by management',
    propertyUnavailable: 'Property is not available for selected dates',
    checkAvailability: 'Check Availability',
    noAvailableProperties: 'No properties available for selected dates',
    noAvailablePropertiesDesc: 'Try selecting different dates to see available properties.',
    resetDateFilter: 'Reset Date Filter',
    selectValidDate: 'Please select a date within the allowed range',
    applyDate: 'Apply Date',
    dateRange: 'Date Range',
    nights: 'Nights',
    total: 'Total',
    exploreNow: 'Explore Now',
    featured: 'Featured',
    ourProperties: 'Our Residences',
    contactUs: 'Contact Us',
    whyUs: 'Why Bintang Property?',
    home: 'Home',
    properties: 'Residences',
    contact: 'Contact',
    rights: 'All Rights Reserved.',
  }
};

// ========== CUSTOM DATE INPUT ==========
interface CustomDateInputProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

const CustomDateInput = ({ value, onClick, placeholder, disabled, icon: Icon }: CustomDateInputProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`w-full px-3 py-2.5 bg-white/90 dark:bg-[#101827] backdrop-blur-sm border border-[#E2E8F0] dark:border-[rgba(33,64,154,0.15)] rounded-xl shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300 text-sm ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    <div className="flex items-center gap-2">
      {Icon ? <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#4F7DFF] transition-colors" /> : <Calendar className="w-4 h-4 text-gray-400 group-hover:text-[#4F7DFF] transition-colors" />}
      <span className={value ? 'text-[#0F172A] dark:text-white' : 'text-gray-400 dark:text-gray-500'}>
        {value || placeholder}
      </span>
    </div>
    <Calendar className="w-3 h-3 text-gray-400 group-hover:text-[#4F7DFF] transition-colors" />
  </motion.button>
);

// ========== MAIN COMPONENT ==========
export default function PropertiesPage() {
  // ========== STATE ==========
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [managements, setManagements] = useState<ManagementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========== REF UNTUK CEGAH DOUBLE FETCH ==========
  const initialized = useRef(false);

  // ========== FILTER STATE ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedManagement, setSelectedManagement] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // ========== DATE FILTER STATE (GLOBAL) ==========
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [maxAllowedDate, setMaxAllowedDate] = useState<Date | null>(null);
  const [bookingWindowDays, setBookingWindowDays] = useState<number>(30);
  const [disabledManagementDates, setDisabledManagementDates] = useState<Date[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isDateFilterApplied, setIsDateFilterApplied] = useState(false);

  // ========== BOOKED DATES PER PROPERTY (CACHED) ==========
  const [bookedDatesCache, setBookedDatesCache] = useState<Record<string, Date[]>>({});

  // ========== UI STATE ==========
  const [language, setLanguage] = useState<Language>('id');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const t = translations[language];

  // ========== ENV ==========
  const managementID = process.env.NEXT_PUBLIC_MANAGEMENT_ID;

  // ========== THEME (Urban Blue - EXROOM) ==========
  const bgDark = isDarkMode ? 'bg-[#081120]' : 'bg-[#F8FAFC]';
  const textPrimary = isDarkMode ? 'text-white' : 'text-[#0F172A]';
  const textSecondary = isDarkMode ? 'text-[#94A3B8]' : 'text-[#64748B]';
  const borderColor = isDarkMode ? 'border-[#1E293B]' : 'border-[#E2E8F0]';

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

  // ========== FETCH MANAGEMENTS ==========
  const fetchManagements = useCallback(async () => {
    try {
      const mgmtQuery = query(
        collection(db, 'management'),
        where('isPublicActive', '==', true)
      );
      const mgmtSnapshot = await getDocs(mgmtQuery);
      const mgmtList: ManagementData[] = mgmtSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          managementName: data.managementName || 'Management',
          brandName: data.brandName || data.managementName,
          brandLogo: data.brandLogo || '',
          brandColor: data.brandColor || '#21409A',
          slug: data.slug || '',
          disabledBookingDates: data.disabledBookingDates || [],
          bookingWindowDays: data.bookingWindowDays || 30,
        };
      });
      setManagements(mgmtList);
      return mgmtList;
    } catch (err) {
      console.error('Error fetching managements:', err);
      return [];
    }
  }, []);

  // ========== FETCH BOOKED DATES FOR A PROPERTY ==========
  const fetchBookedDatesForProperty = useCallback(async (propertyId: string): Promise<Date[]> => {
    if (bookedDatesCache[propertyId]) return bookedDatesCache[propertyId];

    try {
      const q = query(
        collection(db, 'bookings'),
        where('propertyID', '==', propertyId),
        where('paymentStatus', 'in', ['Pending Verification', 'Paid'])
      );
      const snapshot = await getDocs(q);
      const dates: Date[] = [];
      snapshot.docs.forEach((docSnap) => {
        const booking = docSnap.data();
        const startDate = booking.checkInDate?.toDate?.() || booking.checkInDate;
        const endDate = booking.checkOutDate?.toDate?.() || booking.checkOutDate;
        if (startDate && endDate) {
          const currentDate = new Date(startDate);
          while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });
      
      setBookedDatesCache(prev => ({ ...prev, [propertyId]: dates }));
      return dates;
    } catch (err) {
      console.error('Error fetching booked dates:', err);
      return [];
    }
  }, [bookedDatesCache]);

  // ========== CHECK IF PROPERTY IS AVAILABLE FOR DATES ==========
  const isPropertyAvailableForDates = useCallback(async (propertyId: string, checkIn: Date, checkOut: Date): Promise<boolean> => {
    const bookedDates = await fetchBookedDatesForProperty(propertyId);
    if (bookedDates.length === 0) return true;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const current = new Date(checkInDate);
    while (current < checkOutDate) {
      const isBooked = bookedDates.some(d => 
        d.getFullYear() === current.getFullYear() &&
        d.getMonth() === current.getMonth() &&
        d.getDate() === current.getDate()
      );
      if (isBooked) return false;
      current.setDate(current.getDate() + 1);
    }
    return true;
  }, [fetchBookedDatesForProperty]);

  // ========== FETCH PROPERTIES ==========
  const fetchProperties = useCallback(async () => {
    if (!managementID) {
      setError('Management ID not configured');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'properties'),
        where('managementID', '==', managementID)
      );
      const snapshot = await getDocs(q);

      const props: Property[] = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const mgmt = managements.find(m => m.id === data.managementID);
        
        let isAvailable = data.availability === 'available';
        if (isDateFilterApplied && checkInDate && checkOutDate) {
          const available = await isPropertyAvailableForDates(docSnap.id, checkInDate, checkOutDate);
          isAvailable = available && data.availability === 'available';
        }

        return {
          id: docSnap.id,
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
          availability: isAvailable ? 'available' : 'unavailable',
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          facilities: data.facilities || [],
          managementID: data.managementID,
          managementName: mgmt?.brandName || mgmt?.managementName || '',
          managementBrandColor: mgmt?.brandColor || '#21409A',
          createdAt: data.createdAt?.toDate?.() || new Date(),
          description: data.description || '',
          propertyLocationName: data.propertyLocationName || '',
        };
      }));

      setProperties(props);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(t.errorFetch);
    } finally {
      setLoading(false);
    }
  }, [managementID, managements, t.errorFetch, isDateFilterApplied, checkInDate, checkOutDate, isPropertyAvailableForDates]);

  // ========== INITIAL FETCH ==========
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      const mgmtList = await fetchManagements();
      
      const mgmt = mgmtList.find(m => m.id === managementID);
      if (mgmt) {
        const disabledDates = (mgmt.disabledBookingDates || []).map(d => new Date(d));
        setDisabledManagementDates(disabledDates);
        const days = mgmt.bookingWindowDays || 30;
        setBookingWindowDays(days);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + days);
        setMaxAllowedDate(maxDate);
      }

      await fetchProperties();
      if (mgmtList.length === 0) {
        setLoading(false);
      }
    };
    init();
  }, [fetchManagements, fetchProperties, managementID]);

  // ========== REFETCH WHEN DATE FILTER CHANGES ==========
  useEffect(() => {
    if (!initialized.current) return;
    if (!isDateFilterApplied && !checkInDate && !checkOutDate) {
      fetchProperties();
      return;
    }
    if (isDateFilterApplied) {
      fetchProperties();
    }
  }, [isDateFilterApplied, checkInDate, checkOutDate, fetchProperties]);

  // ========== DATE FILTER HANDLERS ==========
  const handleCheckInChange = (date: Date | null) => {
    if (!date) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const mgmt = managements.find(m => m.id === managementID);
    if (mgmt?.disabledBookingDates?.includes(dateStr)) {
      setDateError(t.dateBlocked);
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    if (maxAllowedDate && date > maxAllowedDate) {
      setDateError(t.bookingWindowWarning.replace('{days}', bookingWindowDays.toString()));
      setTimeout(() => setDateError(null), 3000);
      return;
    }

    setCheckInDate(date);
    if (date && checkOutDate && date >= checkOutDate) {
      setCheckOutDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
    }
    if (checkOutDate && date && (checkOutDate.getTime() - date.getTime()) < 24 * 60 * 60 * 1000) {
      setCheckOutDate(new Date(date.getTime() + 24 * 60 * 60 * 1000));
    }
    setDateError(null);
  };

  const handleCheckOutChange = (date: Date | null) => {
    if (date && checkInDate && date <= checkInDate) {
      setCheckInDate(new Date(date.getTime() - 24 * 60 * 60 * 1000));
    }
    setCheckOutDate(date);
  };

  const applyDateFilter = () => {
    if (!checkInDate || !checkOutDate) {
      toast.warning(t.selectCheckIn);
      return;
    }
    setIsDateFilterApplied(true);
    toast.success(`Menampilkan properti untuk ${checkInDate.toLocaleDateString()} - ${checkOutDate.toLocaleDateString()}`);
  };

  const resetDateFilter = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setIsDateFilterApplied(false);
    setDateError(null);
    toast.success('Filter tanggal direset');
  };

  // ========== FILTER & SORT PROPERTIES ==========
  useEffect(() => {
    let filtered = [...properties];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.city.toLowerCase().includes(term) ||
        p.roomType.toLowerCase().includes(term) ||
        p.unitNumber.toLowerCase().includes(term)
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.propertyType === selectedType);
    }

    if (selectedRoomType !== 'all') {
      filtered = filtered.filter(p => p.roomType === selectedRoomType);
    }

    if (selectedManagement !== 'all') {
      filtered = filtered.filter(p => p.managementName === selectedManagement);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(p => p.propertyLocationName === selectedLocation);
    }

    filtered = filtered.filter(p =>
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.directPrice || a.price) - (b.directPrice || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.directPrice || b.price) - (a.directPrice || a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, selectedCity, selectedType, selectedRoomType, selectedManagement, selectedLocation, priceRange, sortBy]);

  // ========== GET UNIQUE VALUES FOR FILTERS ==========
  const cities = useMemo(() => {
    const citySet = new Set<string>();
    properties.forEach(p => { if (p.city) citySet.add(p.city); });
    return Array.from(citySet);
  }, [properties]);

  const propertyTypes = useMemo(() => {
    const typeSet = new Set<string>();
    properties.forEach(p => { if (p.propertyType) typeSet.add(p.propertyType); });
    return Array.from(typeSet);
  }, [properties]);

  const roomTypes = useMemo(() => {
    const typeSet = new Set<string>();
    properties.forEach(p => { if (p.roomType) typeSet.add(p.roomType); });
    return Array.from(typeSet);
  }, [properties]);

  const managementNames = useMemo(() => {
    const nameSet = new Set<string>();
    properties.forEach(p => { if (p.managementName) nameSet.add(p.managementName); });
    return Array.from(nameSet);
  }, [properties]);

  const propertyLocations = useMemo(() => {
    const locSet = new Set<string>();
    properties.forEach(p => { if (p.propertyLocationName) locSet.add(p.propertyLocationName); });
    return Array.from(locSet);
  }, [properties]);

  // ========== LOADING ==========
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${bgDark}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // ========== ERROR ==========
  if (error) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${bgDark} p-4`}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className={`text-2xl font-bold ${textPrimary} mb-2`}>Oops!</h1>
          <p className={`${textSecondary} mb-6`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#21409A] text-white rounded-xl hover:bg-[#4F7DFF] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER ==========
  return (
    <div className={`${bgDark} transition-colors duration-300 overflow-x-hidden`}>
      <ToastContainer theme={isDarkMode ? 'dark' : 'light'} position="top-right" autoClose={3000} />

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? `${isDarkMode ? 'bg-[#081120]/95' : 'bg-white/95'} backdrop-blur-md shadow-lg`
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* ===== LOGO EXROOM ===== */}
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
                      className={`absolute top-full right-0 mt-2 w-40 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-xl shadow-xl overflow-hidden border ${borderColor} z-50`}
                    >
                      <button
                        onClick={() => { setLanguage('id'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2`}
                      >
                        🇮🇩 Indonesia {language === 'id' && <CheckCircle className="w-4 h-4 text-[#4F7DFF] ml-auto" />}
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2 text-left ${textPrimary} hover:bg-[#4F7DFF]/10 flex items-center gap-2 border-t ${borderColor}`}
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

      {/* ========== HERO ========== */}
      <section className="relative py-20 pt-32 md:pt-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#081120] via-[#12214A] to-[#081120]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#4F7DFF]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#21409A]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10"
            >
              <Crown className="w-4 h-4 text-[#4F7DFF]" />
              <span className="text-white text-sm font-medium">{t.featured}</span>
            </motion.div>

            <h1 className="text-3xl md:text-5xl font-light text-white mb-4 tracking-tight">
              {t.title}
            </h1>
            <p className="text-white/70 text-lg max-w-2xl mx-auto font-light">
              {t.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm border border-white/10">
                <Home className="w-4 h-4" />
                {filteredProperties.length} {t.propertiesFound}
              </span>
              {isDateFilterApplied && checkInDate && checkOutDate && (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#4F7DFF]/30 backdrop-blur-sm rounded-full text-white text-sm border border-[#4F7DFF]/30">
                  <Calendar className="w-3 h-3" />
                  {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FILTERS & CONTROLS ========== */}
      <section className="sticky top-16 md:top-20 z-40 bg-[#081120]/95 backdrop-blur-md border-b border-[rgba(79,125,255,0.08)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} border ${borderColor} rounded-xl ${textPrimary} placeholder-gray-400 focus:ring-2 focus:ring-[#4F7DFF] focus:border-transparent transition-all`}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="flex bg-gray-100/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#4F7DFF]/20 text-[#4F7DFF]' : 'text-gray-400'}`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#4F7DFF]/20 text-[#4F7DFF]' : 'text-gray-400'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className={`px-4 py-2.5 ${isDarkMode ? 'bg-[#101827]' : 'bg-white'} border ${borderColor} rounded-xl ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF] appearance-none pr-10`}
                >
                  <option value="newest">{t.sortNewest}</option>
                  <option value="price_asc">{t.sortPriceLow}</option>
                  <option value="price_desc">{t.sortPriceHigh}</option>
                  <option value="popular">{t.sortPopular}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  showFilters
                    ? 'bg-[#4F7DFF] text-white border-[#4F7DFF]'
                    : `${isDarkMode ? 'bg-[#101827] border-[rgba(79,125,255,0.15)]' : 'bg-white border-[#E2E8F0]'} ${textPrimary} hover:bg-[#4F7DFF]/10`
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">{t.filter}</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-[rgba(79,125,255,0.08)]">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* ====== DATE FILTERS ====== */}
                    <div className="col-span-2 md:col-span-3 lg:col-span-5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
                            {t.checkIn}
                          </label>
                          <DatePicker
                            selected={checkInDate}
                            onChange={handleCheckInChange}
                            selectsStart
                            startDate={checkInDate || undefined}
                            endDate={checkOutDate || undefined}
                            minDate={new Date()}
                            maxDate={maxAllowedDate || undefined}
                            excludeDates={disabledManagementDates}
                            placeholderText={t.selectCheckIn}
                            customInput={<CustomDateInput icon={Calendar} placeholder={t.selectCheckIn} />}
                            popperPlacement="bottom-start"
                            popperClassName="datepicker-popper"
                          />
                        </div>

                        <div>
                          <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
                            {t.checkOut}
                          </label>
                          <DatePicker
                            selected={checkOutDate}
                            onChange={handleCheckOutChange}
                            selectsEnd
                            startDate={checkInDate || undefined}
                            endDate={checkOutDate || undefined}
                            minDate={checkInDate ? addDays(checkInDate, 1) : new Date()}
                            maxDate={maxAllowedDate || undefined}
                            excludeDates={disabledManagementDates}
                            placeholderText={t.selectCheckOut}
                            customInput={<CustomDateInput icon={Calendar} placeholder={t.selectCheckOut} />}
                            popperPlacement="bottom-start"
                            popperClassName="datepicker-popper"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <button
                            onClick={applyDateFilter}
                            disabled={!checkInDate || !checkOutDate}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-all ${
                              !checkInDate || !checkOutDate
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#21409A] hover:bg-[#4F7DFF] shadow-lg shadow-[#21409A]/30'
                            }`}
                          >
                            {t.checkAvailability}
                          </button>
                          {isDateFilterApplied && (
                            <button
                              onClick={resetDateFilter}
                              className="px-3 py-2.5 rounded-xl border border-[rgba(79,125,255,0.15)] text-gray-400 hover:bg-[#4F7DFF]/10 transition"
                              title={t.resetDateFilter}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {dateError && (
                        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-red-400">{dateError}</span>
                        </div>
                      )}
                      {maxAllowedDate && (
                        <div className={`mt-1 text-xs ${textSecondary} flex items-center gap-1`}>
                          <Info className="w-3 h-3" />
                          {t.maxDateInfo.replace('{date}', maxAllowedDate.toLocaleDateString())}
                        </div>
                      )}
                      {isDateFilterApplied && checkInDate && checkOutDate && (
                        <div className={`mt-1 text-xs text-[#4F7DFF] flex items-center gap-1`}>
                          <Check className="w-3 h-3" />
                          Menampilkan properti yang tersedia untuk {checkInDate.toLocaleDateString()} - {checkOutDate.toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>{t.city}</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#101827] text-white border-[rgba(79,125,255,0.15)]' : 'bg-gray-50 text-gray-900 border-[#E2E8F0]'} border rounded-lg text-sm ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF]`}
                      >
                        <option value="all">{t.allCities}</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>{t.propertyType}</label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#101827] text-white border-[rgba(79,125,255,0.15)]' : 'bg-gray-50 text-gray-900 border-[#E2E8F0]'} border rounded-lg text-sm ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF]`}
                      >
                        <option value="all">{t.allTypes}</option>
                        {propertyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>{t.roomType}</label>
                      <select
                        value={selectedRoomType}
                        onChange={(e) => setSelectedRoomType(e.target.value)}
                        className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#101827] text-white border-[rgba(79,125,255,0.15)]' : 'bg-gray-50 text-gray-900 border-[#E2E8F0]'} border rounded-lg text-sm ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF]`}
                      >
                        <option value="all">{t.allRoomTypes}</option>
                        {roomTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>{t.management}</label>
                      <select
                        value={selectedManagement}
                        onChange={(e) => setSelectedManagement(e.target.value)}
                        className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#101827] text-white border-[rgba(79,125,255,0.15)]' : 'bg-gray-50 text-gray-900 border-[#E2E8F0]'} border rounded-lg text-sm ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF]`}
                      >
                        <option value="all">{t.allManagements}</option>
                        {managementNames.map(name => (
                          <option key={name} value={name}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
                        <Landmark className="w-3 h-3 inline mr-1" />
                        {t.propertyLocation}
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className={`w-full px-3 py-2 ${isDarkMode ? 'bg-[#101827] text-white border-[rgba(79,125,255,0.15)]' : 'bg-gray-50 text-gray-900 border-[#E2E8F0]'} border rounded-lg text-sm ${textPrimary} focus:ring-2 focus:ring-[#4F7DFF]`}
                      >
                        <option value="all">{t.allLocations}</option>
                        {propertyLocations.map(loc => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2 md:col-span-3 lg:col-span-5">
                      <label className={`block text-xs font-medium ${textSecondary} mb-1`}>{t.priceRange}</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min={0}
                          max={10000000}
                          step={50000}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1 accent-[#4F7DFF]"
                        />
                        <div className="flex gap-2 text-sm">
                          <span className={`${textSecondary}`}>Rp {(priceRange[0] / 1000).toFixed(0)}k</span>
                          <span className={`${textSecondary}`}>-</span>
                          <span className={`${textSecondary}`}>Rp {(priceRange[1] / 1000).toFixed(0)}k</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-[rgba(79,125,255,0.08)]">
                    <button
                      onClick={() => {
                        setSelectedCity('all');
                        setSelectedType('all');
                        setSelectedRoomType('all');
                        setSelectedManagement('all');
                        setSelectedLocation('all');
                        setPriceRange([0, 10000000]);
                        setSearchTerm('');
                        resetDateFilter();
                      }}
                      className={`px-4 py-2 text-sm rounded-lg ${textSecondary} hover:bg-[#4F7DFF]/10 transition`}
                    >
                      {t.resetFilters}
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 text-sm bg-[#21409A] text-white rounded-lg hover:bg-[#4F7DFF] transition"
                    >
                      {t.applyFilters}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ========== PROPERTIES GRID ========== */}
      <section className="py-8 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`flex justify-between items-center mb-6 ${textSecondary}`}>
          <span className="text-sm font-light">
            {filteredProperties.length} {t.propertiesFound}
          </span>
          {filteredProperties.length > 0 && (
            <span className="text-sm font-light hidden sm:inline">
              {t.from} {formatCurrency(Math.min(...filteredProperties.map(p => p.directPrice || p.price)))}
            </span>
          )}
        </div>

        {filteredProperties.length === 0 ? (
          <div className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl p-12 text-center border ${borderColor}`}>
            <Home className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className={`text-xl font-light ${textPrimary} mb-2`}>
              {isDateFilterApplied ? t.noAvailableProperties : t.noProperties}
            </h3>
            <p className={textSecondary}>
              {isDateFilterApplied ? t.noAvailablePropertiesDesc : t.noPropertiesDesc}
            </p>
            {isDateFilterApplied && (
              <button
                onClick={resetDateFilter}
                className="mt-4 px-4 py-2 text-sm bg-[#21409A] text-white rounded-lg hover:bg-[#4F7DFF] transition"
              >
                {t.resetDateFilter}
              </button>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredProperties.map((property, index) => {
              const displayPrice = property.directPrice || property.price;
              const isAvailable = property.availability === 'available';
              const brandColor = property.managementBrandColor || '#21409A';

              return (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className={`${isDarkMode ? 'bg-[#101827]' : 'bg-white'} rounded-2xl overflow-hidden border ${borderColor} shadow-lg hover:shadow-xl transition-all duration-300 group ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}
                >
                  {/* Blue accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#21409A] to-[#4F7DFF] opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'sm:w-64 sm:h-48 flex-shrink-0' : 'h-48'}`}>
                    {property.photoURLs.length > 0 ? (
                      <Image
                        src={property.photoURLs[0]}
                        alt={property.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                        <Home className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isAvailable
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                      }`}>
                        {isAvailable ? t.available : t.occupied}
                      </span>
                    </div>
                    
                    {/* Harga */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-lg text-sm font-bold flex items-center gap-1">
                      {formatCurrency(displayPrice)} {t.perNight}
                    </div>
                    
                    {property.managementName && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-white rounded-lg text-xs">
                        {property.managementName}
                      </div>
                    )}
                  </div>

                  <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : ''}`}>
                    <div>
                      <h3 className={`font-bold ${textPrimary} text-lg truncate`}>{property.name}</h3>
                      <div className={`flex items-center gap-1 text-sm ${textSecondary} mt-1`}>
                        <MapPin className="w-4 h-4" />
                        <span>{property.city}, {property.country}</span>
                      </div>
                      {property.propertyLocationName && (
                        <div className={`flex items-center gap-1 text-xs ${textSecondary} mt-0.5`}>
                          <Building2 className="w-3 h-3" />
                          <span>{t.propertyLocation}: {property.propertyLocationName}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Bed className="w-4 h-4" />
                          <span>{property.bedrooms || 1}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Bath className="w-4 h-4" />
                          <span>{property.bathrooms || 1}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Layers className="w-4 h-4" />
                          <span>Lt. {property.floor}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Building2 className="w-4 h-4" />
                          <span>Tower {property.tower}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'text-[#4F7DFF] fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                        <span className={`text-xs ${textSecondary} ml-1`}>(4.8)</span>
                      </div>

                      {property.facilities && property.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {property.facilities.slice(0, 3).map((facility, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-[#4F7DFF]/10 text-[#4F7DFF] text-xs rounded-full">
                              {facility}
                            </span>
                          ))}
                          {property.facilities.length > 3 && (
                            <span className="px-2 py-0.5 text-xs text-gray-400">+{property.facilities.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <Link href={property.id ? `/property/${property.id}` : '#'}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-4 py-2.5 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: isAvailable ? brandColor : '#6B7280',
                        }}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? (
                          <>
                            {t.viewDetails}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          t.occupied
                        )}
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* ========== FOOTER ========== */}
      <footer className={`border-t ${borderColor} py-8 px-6 lg:px-8 max-w-7xl mx-auto`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#21409A] flex items-center justify-center">
              <span className="text-white font-bold text-sm">EX</span>
            </div>
            <span className={`text-sm font-light ${textPrimary}`}>EXROOM</span>
          </div>
          <div className={`text-xs ${textSecondary} tracking-widest`}>
            © {new Date().getFullYear()} EXROOM. {t.rights}
          </div>
          <div className="flex gap-6">
            <a href="#" className={`${textSecondary} hover:text-[#4F7DFF] transition text-xs uppercase tracking-widest`}>Privacy</a>
            <a href="#" className={`${textSecondary} hover:text-[#4F7DFF] transition text-xs uppercase tracking-widest`}>Terms</a>
          </div>
        </div>
      </footer>

      {/* DatePicker Styles */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit !important;
          border-radius: 0.75rem !important;
          border: 1px solid #E2E8F0 !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
          overflow: hidden !important;
        }
        .dark .react-datepicker {
          background-color: #101827 !important;
          border-color: rgba(33,64,154,0.2) !important;
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
        .datepicker-popper {
          z-index: 50 !important;
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
      `}</style>
    </div>
  );
}