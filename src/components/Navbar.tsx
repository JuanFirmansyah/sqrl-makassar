import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHome, FaInfoCircle, FaEnvelope, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { motion } from 'framer-motion';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({ subsets: ['latin'], weight: ['400', '700'] });

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full transition-all duration-300 ${montserrat.className} ${isScrolled ? 'bg-white text-black shadow-lg' : 'bg-transparent text-white'} py-4 z-50`}>
      <div className="container mx-auto flex justify-between items-center px-4 md:px-10">
        {/* Logo */}
        <Link href="/">
          <Image src="/mnt/data/image.png" alt="Logo" width={120} height={40} className="h-12 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="hover:underline flex items-center">
            <FaHome className="mr-2" /> Home
          </Link>
          <Link href="/about" className="hover:underline flex items-center">
            <FaInfoCircle className="mr-2" /> Tentang Kami
          </Link>
          <Link href="/contact" className="hover:underline flex items-center">
            <FaEnvelope className="mr-2" /> Hubungi Kami
          </Link>
          <Link href="/explore" className="bg-orange-500 text-white font-bold py-1 px-6 rounded-full shadow-lg hover:bg-orange-600 transition">
            Jelajahi Apartemen
          </Link>
        </div>

        {/* Burger Menu Button */}
        <button className="md:hidden focus:outline-none" onClick={() => setMenuOpen(true)}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Menu */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} md:hidden z-50`} onClick={() => setMenuOpen(false)}></div>

      <motion.aside initial={{ x: '100%' }} animate={menuOpen ? { x: 0 } : { x: '100%' }} transition={{ type: 'tween', duration: 0.3 }} className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg md:hidden z-50 p-5 flex flex-col">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-lg font-bold text-orange-500">Menu</h2>
          <button onClick={() => setMenuOpen(false)} className="text-gray-700">
            <IoMdClose className="w-7 h-7" />
          </button>
        </div>

        <ul className="space-y-4 text-lg font-semibold mt-4">
          <li>
            <Link href="/" className="block text-black" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/about" className="block text-black" onClick={() => setMenuOpen(false)}>
              Tentang Kami
            </Link>
          </li>
          <li>
            <Link href="/listings" className="block text-black" onClick={() => setMenuOpen(false)}>
              Listings
            </Link>
          </li>
          <li>
            <Link href="/maps" className="block text-black" onClick={() => setMenuOpen(false)}>
              Maps
            </Link>
          </li>
          <li>
            <Link href="/faq" className="block text-black" onClick={() => setMenuOpen(false)}>
              FAQ
            </Link>
          </li>
          <li>
            <Link href="/blog" className="block text-black" onClick={() => setMenuOpen(false)}>
              Blog
            </Link>
          </li>
        </ul>

        <div className="mt-auto">
          <p className="text-orange-500 font-bold">Call Support</p>
          <p className="text-black">0811277288</p>
          <p className="text-orange-500 font-bold mt-2">Email Address</p>
          <p className="text-black">support@flexx.id</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="text-blue-600 text-2xl"><FaFacebook /></a>
            <a href="#" className="text-blue-400 text-2xl"><FaTwitter /></a>
            <a href="#" className="text-pink-600 text-2xl"><FaInstagram /></a>
          </div>
        </div>
      </motion.aside>
    </nav>
  );
}
