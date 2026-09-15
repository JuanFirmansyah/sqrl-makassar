import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <h3 className="text-lg font-bold">Bintang</h3>
        <p className="mt-2 text-gray-400">Solusi terbaik untuk mencari dan mengelola apartemen impian Anda.</p>
        <div className="flex justify-center space-x-4 mt-4">
          <a href="#" className="text-gray-400 hover:text-white">
            <FaFacebookF />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaTwitter />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaInstagram />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <FaLinkedinIn />
          </a>
        </div>
        <p className="mt-4 text-sm text-gray-500">© 2024 Manajemen Apartemen. Semua hak dilindungi.</p>
      </div>
    </footer>
  );
}
